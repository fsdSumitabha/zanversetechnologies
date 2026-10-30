"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader, type SVGResult } from "three/examples/jsm/loaders/SVGLoader.js";
import { gsap } from "@/lib/gsap";

/* ───────────────────────────────────────────────────────────────────────────
   The Zan mark in three.js: a TypeScript port of the previous site's hero
   logo (vite-react-shift Logo3DHero), relit for a light page. The symbol is
   the one in the Zan Verse Technologies lockup: a rounded square cut on the
   diagonal into a navy shard and a cyan-to-blue one.

   The mark's SVG is a clean vector with one path per shard, so each path is
   extruded as it is and becomes one piece. Each piece keeps its gradient:
   every vertex carries its height in the drawing, and the shader looks the
   colour up from the same stops as the SVG for every pixel. (Vertex colours
   would only blend between the corners of the outline, and the five-stop
   blue would smear into a two-stop one.)

   Behaviour kept from the old site: cursor tilt and parallax, a magnetic
   pull, hover lift with the neighbour reacting, click to split and
   reassemble, drag to turn, a slow turn as the hero scrolls away, idle float,
   and a fly-in assembly on mount. It renders only while on screen and while
   the tab is visible.

   Changed for this page:
     - lit for a white ground: neutral hemisphere, key and fill lights, a soft
       shadow, no blue rim light, no glow halo; Neutral tone mapping so the
       brand colours stay true;
     - pointer input on its own box, not the window, so it never steals
       clicks from the copy; the custom cursor's hover state via data-cursor;
     - cleanup kills only its own tweens (the old one killed every child of
       gsap.globalTimeline, which would take every other section down too);
     - no OrbitControls (it was disabled anyway), no deprecated Clock.
   ─────────────────────────────────────────────────────────────────────────── */

const FOV = 40;
const MAX_TILT = THREE.MathUtils.degToRad(15);
/** World size of the mark's longest edge. */
const TARGET_SIZE = 2.95;
/** Extrude depth in SVG units (scaled with the geometry): a tenth of the mark's width. */
const DEPTH_SVG = 44;
/** The bevel widens the outline by this much on every side, in SVG units. */
const BEVEL = 1;

/**
 * The mark's own colours: the stops of the two gradients in the SVG, each
 * running top to bottom over the mark's full height. It is the logo, so these
 * are not palette tokens. The keys are the paths' ids; `glow` is the hover
 * emissive.
 */
const SHARDS = {
  "navy-shard": { stops: ["#12326D", "#0B2365", "#030B5B"], glow: 0x2b5cff },
  "blue-shard": { stops: ["#43F7F6", "#2ADAFB", "#18BAFD", "#0D96FE", "#076EFD"], glow: 0x5fe4ff },
} as const;
type ShardId = keyof typeof SHARDS;
const isShardId = (id: string | undefined): id is ShardId => id !== undefined && id in SHARDS;

/**
 * Lit-to-flat calibration: the base colour is scaled so the front faces come
 * out close to the flat SVG under this page's lights and exposure, which is
 * what lets the flat mark fade into the 3D one without a shift in colour.
 * Measured against the SVG in the same frame, with the highlights below.
 */
const LIT_SCALE = 0.95;

/** The shader takes this many stops; a gradient with fewer is resampled to it. */
const STOPS = 5;

/** A gradient's sRGB stops, 0-1, evenly spaced as the SVG has them, resampled to STOPS. */
function shaderStops(hexes: readonly string[]): THREE.Vector3[] {
  const rgb = hexes.map((h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  });
  return Array.from({ length: STOPS }, (_, i) => {
    const t = (i / (STOPS - 1)) * (rgb.length - 1);
    const k = Math.min(Math.floor(t), rgb.length - 2);
    return new THREE.Vector3().fromArray(rgb[k].map((v, c) => v + (rgb[k + 1][c] - v) * (t - k)));
  });
}

/**
 * Satin toy plastic whose base colour is a vertical gradient. `markT` (0 at
 * the top of the drawing, 1 at the bottom) is linear in position, so it
 * interpolates exactly across any triangle; the stops are mixed in sRGB, as
 * the SVG mixes them, and converted to linear for lighting.
 */
function gradientMaterial(stops: THREE.Vector3[], glow: number): THREE.MeshPhysicalMaterial {
  // A light clear coat and little reflection, so the navy reads as the
  // brand's navy on a white page instead of washing out to pale blue wherever
  // it catches the room's light panels.
  const material = new THREE.MeshPhysicalMaterial({
    color: "white",
    metalness: 0,
    roughness: 0.62,
    // The key light sits almost in front of the mark, so its highlight lands
    // on the whole front face; at full strength it laid a white veil over the
    // navy (measured: +0.057 linear on every channel at the top). Weaker
    // highlights leave the bevels to catch the light.
    specularIntensity: 0.3,
    // A thin clear coat: the full coat mirrors the bright room environment
    // across every face and bleaches the navy.
    clearcoat: 0.05,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.08,
    emissive: new THREE.Color(glow),
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uStops = { value: stops };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float markT;\nvarying float vMarkT;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvMarkT = markT;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying float vMarkT;\nuniform vec3 uStops[${STOPS}];`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float markPos = clamp(vMarkT, 0.0, 1.0) * ${STOPS - 1}.0;
        int markStop = int(min(floor(markPos), ${STOPS - 2}.0));
        vec3 markSrgb = mix(uStops[markStop], uStops[markStop + 1], markPos - float(markStop));
        diffuseColor.rgb *= sRGBTransferEOTF(vec4(markSrgb, 1.0)).rgb * ${LIT_SCALE.toFixed(2)};`,
      );
  };
  return material;
}

/**
 * One piece of the mark: an extruded geometry with independent animation
 * channels (hover lift, parallax, magnetic pull, explode offset), composited
 * each frame in update().
 */
class Shard {
  readonly material: THREE.MeshPhysicalMaterial;
  readonly mesh: THREE.Mesh;
  readonly home: THREE.Vector3;
  readonly outward: THREE.Vector3;
  readonly angle: number;
  neighbours: Shard[] = [];

  hoverLift = 0;
  glow = 0;
  readonly parallax = new THREE.Vector3();
  readonly magnetic = new THREE.Vector3();
  readonly offset = new THREE.Vector3();
  readonly offsetRot = new THREE.Vector3();

  constructor(
    geometry: THREE.BufferGeometry,
    stops: THREE.Vector3[],
    glow: number,
    readonly index: number,
    readonly depthFactor: number,
  ) {
    // Pivot on its own centroid so explode spins look natural.
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    const cx = (bb.min.x + bb.max.x) / 2;
    const cy = (bb.min.y + bb.max.y) / 2;
    const cz = (bb.min.z + bb.max.z) / 2;
    geometry.translate(-cx, -cy, -cz);
    geometry.computeVertexNormals();

    this.material = gradientMaterial(stops, glow);

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(cx, cy, cz);
    this.mesh.userData.shard = this;

    this.home = new THREE.Vector3(cx, cy, cz);
    const radial = new THREE.Vector2(cx, cy);
    if (radial.lengthSq() < 1e-4) {
      const a = index * 1.7;
      radial.set(Math.cos(a), Math.sin(a));
    }
    radial.normalize();
    this.outward = new THREE.Vector3(radial.x, radial.y, 0.6).normalize();
    this.angle = Math.atan2(this.outward.y, this.outward.x);
  }

  update() {
    const p = this.mesh.position;
    p.x = this.home.x + this.outward.x * this.hoverLift + this.parallax.x + this.magnetic.x + this.offset.x;
    p.y = this.home.y + this.outward.y * this.hoverLift + this.parallax.y + this.magnetic.y + this.offset.y;
    p.z = this.home.z + this.outward.z * this.hoverLift + this.parallax.z + this.magnetic.z + this.offset.z;
    this.mesh.rotation.set(this.offsetRot.x, this.offsetRot.y, this.offsetRot.z);
    this.material.emissiveIntensity = this.glow * 0.45;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

export interface ZanMark3DProps {
  /** The mark's SVG: one path per shard, with the ids in SHARDS. */
  src: string;
  /** Fraction of the canvas width the mark's longest edge should span. */
  span: number;
  className?: string;
  /** The mark is built and drawn: fade the flat fallback out. */
  onReady?: () => void;
  /** WebGL could not start or was lost: show the flat fallback again. */
  onFail?: () => void;
}

export default function ZanMark3D({ src, span, className, onReady, onFail }: ZanMark3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const announceReady = useEffectEvent(() => onReady?.());
  const announceFail = useEffectEvent(() => onFail?.());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    /* ── Renderer ─────────────────────────────────────────────────────── */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => announceFail());
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Neutral, under-exposed. Measured on the rendered mark: at exposure 1 the
    // brand navy averaged a periwinkle luminance of ~121; ACES is worse here
    // (three.js pre-scales it by 1/0.6). Less light, not a different curve,
    // is what keeps the navy navy on a white page.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.58;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      display: "block",
      width: "100%",
      height: "100%",
      opacity: "0",
      transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
    });
    container.appendChild(canvas);

    /* ── Scene, camera, light ─────────────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 6);
    const lookAt = new THREE.Vector3();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envRT = pmrem.fromScene(room, 0.04);
    scene.environment = envRT.texture;

    // Daylight on a white page: a neutral sky/ground wash, a soft key from
    // upper right, a gentle fill from the left. No coloured rim.
    // Kept low: the page is already white, so a strong wash flattens the
    // navy into pale blue. The key light does the shaping.
    scene.add(new THREE.HemisphereLight("white", new THREE.Color().setRGB(0.86, 0.86, 0.88), 0.18));

    const key = new THREE.DirectionalLight("white", 1.5);
    key.position.set(0.9, 3.2, 8.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 10;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    const sc = key.shadow.camera;
    sc.near = 1;
    sc.far = 30;
    sc.left = sc.bottom = -4;
    sc.right = sc.top = 4;
    scene.add(key);

    const fill = new THREE.DirectionalLight("white", 0.35);
    fill.position.set(-5, 0.5, 4);
    scene.add(fill);

    // An invisible wall behind the mark that only catches its shadow.
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ opacity: 0.06 }));
    wall.position.z = -1.45;
    wall.receiveShadow = true;
    scene.add(wall);

    /* ── The mark ─────────────────────────────────────────────────────── */
    const group = new THREE.Group();
    scene.add(group);
    const shards: Shard[] = [];
    const meshes: THREE.Mesh[] = [];
    let formTl: gsap.core.Timeline | null = null;
    let explodeTl: gsap.core.Timeline | null = null;
    let hovered: Shard | null = null;

    const build = (data: SVGResult) => {
      if (disposed) return;
      const extrude: THREE.ExtrudeGeometryOptions = {
        depth: DEPTH_SVG,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: BEVEL,
        bevelOffset: 0,
        bevelSegments: 3,
        // The shards' big rounded corners facet visibly at fewer segments.
        curveSegments: 24,
        steps: 1,
      };

      // 1) Extrude each shard's path as it is.
      const parts: { geo: THREE.BufferGeometry; id: ShardId }[] = [];
      const union = new THREE.Box3();
      for (const path of data.paths) {
        const id = (path.userData?.node as Element | undefined)?.id;
        if (!isShardId(id)) continue;
        const shapes = SVGLoader.createShapes(path);
        if (!shapes.length) continue;
        const geo = new THREE.ExtrudeGeometry(shapes, extrude);
        geo.computeBoundingBox();
        union.union(geo.boundingBox!);
        parts.push({ geo, id });
      }
      if (!parts.length) {
        announceFail();
        return;
      }

      // 2) Each vertex's height in the drawing, 0 at the top and 1 at the
      //    bottom, before anything moves: both gradients span the whole mark.
      const top = union.min.y + BEVEL;
      const height = union.max.y - union.min.y - 2 * BEVEL;
      for (const { geo } of parts) {
        const pos = geo.getAttribute("position");
        const t = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i++) t[i] = (pos.getY(i) - top) / height;
        geo.setAttribute("markT", new THREE.BufferAttribute(t, 1));
      }

      // 3) Centre, scale and flip Y (SVG is y-down).
      const size = union.getSize(new THREE.Vector3());
      const center = union.getCenter(new THREE.Vector3());
      const s = TARGET_SIZE / Math.max(size.x, size.y);
      const toWorld = new THREE.Matrix4()
        .makeScale(s, -s, s)
        .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -DEPTH_SVG / 2));

      parts.forEach(({ geo, id }, idx) => {
        geo.applyMatrix4(toWorld);
        const shard = new Shard(geo, shaderStops(SHARDS[id].stops), SHARDS[id].glow, idx, 0.45 + (idx % 3) * 0.2);
        shards.push(shard);
        meshes.push(shard.mesh);
        group.add(shard.mesh);
      });

      // Each shard's neighbour is the other one.
      for (const sh of shards) sh.neighbours = shards.filter((o) => o !== sh);

      // Fly in and assemble, while the flat mark fades out underneath.
      formTl = gsap.timeline();
      shards.forEach((sh, i) => {
        const dist = 3 + Math.random() * 2;
        const ang = Math.random() * Math.PI * 2;
        sh.offset.set(Math.cos(ang) * dist, Math.sin(ang) * dist, (Math.random() - 0.5) * 4);
        sh.offsetRot.set(
          (Math.random() - 0.5) * Math.PI * 3,
          (Math.random() - 0.5) * Math.PI * 3,
          (Math.random() - 0.5) * Math.PI * 3,
        );
        sh.glow = 0.5;
        const at = i * 0.1;
        formTl!
          .to(sh.offset, { x: 0, y: 0, z: 0, duration: 1.5, ease: "back.out(1.4)" }, at)
          .to(sh.offsetRot, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power3.out" }, at)
          .to(sh, { glow: 0, duration: 1.2, ease: "power2.out" }, at + 0.3);
      });

      canvas.style.opacity = "1";
      announceReady();
    };

    // The shards' fills are gradient references, which SVGLoader would hand
    // to THREE.Color (and warn about). The colours come from SHARDS, so the
    // references are dropped before parsing.
    fetch(src)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`${res.status} ${src}`))))
      .then((text) => build(new SVGLoader().parse(text.replace(/\sfill="url\([^)]*\)"/g, ""))))
      .catch(() => {
        if (!disposed) announceFail();
      });

    /* ── Input: on its own box ────────────────────────────────────────── */
    const rawNdc = new THREE.Vector2();
    const ndc = new THREE.Vector2();
    let inside = false;
    let down: { x: number; y: number; time: number } | null = null;
    let dragging = false;
    let dragLastX = 0;
    let dragLastY = 0;
    const dragRot = new THREE.Vector2();

    const toNdc = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      rawNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const onMove = (e: PointerEvent) => {
      inside = true;
      toNdc(e);
      if (dragging) {
        dragRot.y += (e.clientX - dragLastX) * 0.01;
        dragRot.x = THREE.MathUtils.clamp(dragRot.x + (e.clientY - dragLastY) * 0.01, -1.1, 1.1);
        dragLastX = e.clientX;
        dragLastY = e.clientY;
      }
    };
    const onLeave = () => {
      if (dragging) return;
      inside = false;
      rawNdc.set(0, 0);
    };
    const onDown = (e: PointerEvent) => {
      toNdc(e);
      down = { x: e.clientX, y: e.clientY, time: performance.now() };
      if (hovered && e.pointerType === "mouse") {
        dragging = true;
        dragLastX = e.clientX;
        dragLastY = e.clientY;
        container.setPointerCapture(e.pointerId);
      }
    };
    const onUp = (e: PointerEvent) => {
      if (dragging) {
        dragging = false;
        if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
      }
      if (!down) return;
      const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dt = performance.now() - down.time;
      down = null;
      // A tap (not a drag) that lands on the mark itself.
      if (dist < 8 && dt < 350 && hovered) explode();
    };
    const onCancel = () => {
      dragging = false;
      down = null;
      onLeave();
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("pointercancel", onCancel);

    /* ── Hover and explode ────────────────────────────────────────────── */
    const hoverEnter = (s: Shard) => {
      gsap.to(s, { hoverLift: 0.4, glow: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      s.neighbours.forEach((n) =>
        gsap.to(n, { hoverLift: 0.16, glow: 0.3, duration: 0.55, ease: "power3.out", overwrite: "auto" }),
      );
    };
    const hoverLeave = (s: Shard) => {
      [s, ...s.neighbours].forEach((x) =>
        gsap.to(x, { hoverLift: 0, glow: 0, duration: 0.65, ease: "power2.out", overwrite: "auto" }),
      );
    };

    const explode = () => {
      if (!shards.length || explodeTl?.isActive()) return;
      formTl?.kill();
      const OUT = 0.55;
      const HOLD = 0.35;
      const BACK = 1.3;
      const tl = gsap.timeline({ onComplete: () => void (explodeTl = null) });
      for (const s of shards) {
        gsap.killTweensOf(s.offset);
        gsap.killTweensOf(s.offsetRot);
        // The mark splits along its cut: the halves slide apart and tilt.
        // Each half is half the mark, so a bigger spread or spin carries its
        // corners past the canvas edge, where they are cut off.
        const spread = 0.32 + Math.random() * 0.12;
        tl.to(
          s.offset,
          {
            x: s.outward.x * spread + (Math.random() - 0.5) * 0.1,
            y: s.outward.y * spread + (Math.random() - 0.5) * 0.1,
            z: (Math.random() - 0.5) * 0.5 + s.outward.z * 0.4,
            duration: OUT,
            ease: "power3.out",
          },
          0,
        )
          .to(
            s.offsetRot,
            {
              x: (Math.random() - 0.5) * Math.PI * 0.4,
              y: (Math.random() - 0.5) * Math.PI * 0.4,
              z: (Math.random() - 0.5) * Math.PI * 0.2,
              duration: OUT,
              ease: "power2.out",
            },
            0,
          )
          // The split replaces the hover pose rather than adding to it.
          .to(s, { glow: 0.6, hoverLift: 0, duration: OUT, ease: "power1.out" }, 0)
          .to(s.offset, { x: 0, y: 0, z: 0, duration: BACK, ease: "elastic.out(1, 0.55)" }, OUT + HOLD)
          .to(s.offsetRot, { x: 0, y: 0, z: 0, duration: BACK, ease: "elastic.out(1, 0.6)" }, OUT + HOLD)
          .to(s, { glow: 0, duration: BACK * 0.6, ease: "power2.out" }, OUT + HOLD);
      }
      explodeTl = tl;
    };

    /* ── Loop ─────────────────────────────────────────────────────────── */
    const tilt = new THREE.Vector2();
    const camParallax = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const cursorWorld = new THREE.Vector3();
    let scrollRot = 0;
    let frame = 0;
    let elapsed = 0;
    let last = performance.now();

    const checkHover = () => {
      raycaster.setFromCamera(rawNdc, camera);
      const hits = inside && meshes.length ? raycaster.intersectObjects(meshes, false) : [];
      const shard = hits.length ? (hits[0].object.userData.shard as Shard) : null;
      if (shard !== hovered) {
        if (hovered) hoverLeave(hovered);
        if (shard) hoverEnter(shard);
        hovered = shard;
      }
      // The custom cursor draws its own hover state (data-cursor on the box).
      if (!document.documentElement.classList.contains("zan-cursor")) {
        container.style.cursor = dragging ? "grabbing" : shard ? "pointer" : "";
      }
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const t = elapsed;

      const sk = 1 - Math.pow(0.0015, dt);
      ndc.x += (rawNdc.x - ndc.x) * sk;
      ndc.y += (rawNdc.y - ndc.y) * sk;

      frame++;
      if (frame % 2 === 0) checkHover();

      const damp = 1 - Math.pow(0.001, dt);
      tilt.x += (-ndc.y * MAX_TILT - tilt.x) * damp;
      tilt.y += (ndc.x * MAX_TILT - tilt.y) * damp;

      // A slow turn as the hero scrolls away. The hero opens the page, so
      // its progress is simply scrollY over one viewport.
      const scrollTarget = Math.min(window.scrollY / window.innerHeight, 1.2) * 0.8;
      scrollRot += (scrollTarget - scrollRot) * damp * 0.6;

      // A drag turns it; let go and it drifts home.
      if (!dragging) dragRot.multiplyScalar(1 - damp * 0.06);

      group.rotation.x = tilt.x + Math.sin(t * 0.4) * 0.04 + dragRot.x;
      group.rotation.y = tilt.y + scrollRot + Math.cos(t * 0.33) * 0.05 + dragRot.y;
      group.rotation.z = Math.sin(t * 0.22) * 0.02;
      group.position.y = Math.sin(t * 0.6) * 0.06;
      group.scale.setScalar(1 + Math.sin(t * 0.8) * 0.015);

      raycaster.setFromCamera(ndc, camera);
      const onPlane = raycaster.ray.intersectPlane(plane, cursorWorld);
      const magField = onPlane && inside ? THREE.MathUtils.clamp(1 - cursorWorld.length() / 2.6, 0, 1) : 0;

      for (const s of shards) {
        s.parallax.x += (ndc.x * 0.16 * s.depthFactor - s.parallax.x) * damp;
        s.parallax.y += (ndc.y * 0.16 * s.depthFactor - s.parallax.y) * damp;
        const mx = magField > 0 ? (cursorWorld.x - s.home.x) * 0.12 * magField * s.depthFactor : 0;
        const my = magField > 0 ? (cursorWorld.y - s.home.y) * 0.12 * magField * s.depthFactor : 0;
        s.magnetic.x += (mx - s.magnetic.x) * damp;
        s.magnetic.y += (my - s.magnetic.y) * damp;
        s.update();
      }

      // Camera parallax for this frame only, then restored.
      const ck = 1 - Math.pow(0.0025, dt);
      camParallax.x += (ndc.x * 0.4 - camParallax.x) * ck;
      camParallax.y += (ndc.y * 0.28 - camParallax.y) * ck;
      camera.position.x += camParallax.x;
      camera.position.y += camParallax.y;
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
      camera.position.x -= camParallax.x;
      camera.position.y -= camParallax.y;
    };

    // Render only while on screen and the tab is visible.
    let running = false;
    let onScreen = true;
    const sync = () => {
      const want = onScreen && document.visibilityState !== "hidden";
      if (want && !running) {
        last = performance.now();
        renderer.setAnimationLoop(tick);
      } else if (!want && running) {
        renderer.setAnimationLoop(null);
      }
      running = want;
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(container);
    document.addEventListener("visibilitychange", sync);
    sync();

    const onLost = (e: Event) => {
      e.preventDefault();
      renderer.setAnimationLoop(null);
      running = false;
      announceFail();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    /* ── Size: the mark spans `span` of the canvas width ──────────────── */
    const fit = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      camera.position.z = TARGET_SIZE / span / (2 * halfTan * camera.aspect);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    fit();

    /* ── Cleanup: only what this component made ──────────────────────── */
    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onLost);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onCancel);
      container.style.cursor = "";
      formTl?.kill();
      explodeTl?.kill();
      for (const s of shards) {
        gsap.killTweensOf([s, s.offset, s.offsetRot]);
        s.dispose();
      }
      wall.geometry.dispose();
      (wall.material as THREE.Material).dispose();
      envRT.dispose();
      pmrem.dispose();
      room.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [src, span]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-cursor
      className={className}
      style={{ touchAction: "pan-y", userSelect: "none" }}
    />
  );
}
