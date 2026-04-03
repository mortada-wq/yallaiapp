"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function SahibLogo({ className }: { className?: string }) {
  const rid = useId().replace(/:/g, "");
  const f = `sahib-logo-f-${rid}`;
  const p0 = `sahib-logo-p0-${rid}`;
  const p1 = `sahib-logo-p1-${rid}`;
  const p2 = `sahib-logo-p2-${rid}`;
  const p3 = `sahib-logo-p3-${rid}`;
  const p4 = `sahib-logo-p4-${rid}`;
  const p5 = `sahib-logo-p5-${rid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={84}
      height={33}
      viewBox="0 0 28 11"
      fill="none"
      className={cn("h-6 w-auto shrink-0 sm:h-7", className)}
      aria-label="sahib.chat"
      role="img"
    >
      <title>sahib.chat</title>
      <g filter={`url(#${f})`}>
        <path
          d="M10.3448 5.50381H8.63278C8.40878 5.78114 8.29678 6.12781 8.29678 6.54381C8.29678 6.95981 8.41411 7.28514 8.64878 7.5198H10.3448V5.50381ZM6.90478 1.0238H10.8728C11.5128 1.4078 11.9341 1.85047 12.1368 2.3518C12.3394 2.84247 12.4408 3.51447 12.4408 4.36781V6.76781C12.4408 7.65314 12.4621 8.46381 12.5048 9.19981H10.6808L10.3928 8.62381C9.97678 9.00781 9.39011 9.19981 8.63278 9.19981H7.62478C6.71811 8.60247 6.26478 7.74381 6.26478 6.62381C6.26478 5.49314 6.72878 4.60247 7.65678 3.95181H9.16078C9.57678 3.95181 9.96612 4.07981 10.3288 4.3358V3.53581C10.3288 3.11981 10.1474 2.84247 9.78478 2.7038H6.90478V1.0238Z"
          fill={`url(#${p0})`}
          shapeRendering="crispEdges"
        />
        <path
          d="M14.5889 0.799805V9.19981H13.0049V0.799805H14.5889Z"
          fill={`url(#${p1})`}
          shapeRendering="crispEdges"
        />
        <path
          d="M16.7222 0.799805V9.19981H15.1382V0.799805H16.7222Z"
          fill={`url(#${p2})`}
          shapeRendering="crispEdges"
        />
        <path
          d="M21.2995 5.50381H19.5875C19.3635 5.78114 19.2515 6.12781 19.2515 6.54381C19.2515 6.95981 19.3688 7.28514 19.6035 7.5198H21.2995V5.50381ZM17.8595 1.0238H21.8275C22.4675 1.4078 22.8888 1.85047 23.0915 2.3518C23.2941 2.84247 23.3955 3.51447 23.3955 4.36781V6.76781C23.3955 7.65314 23.4168 8.46381 23.4595 9.19981H21.6355L21.3475 8.62381C20.9315 9.00781 20.3448 9.19981 19.5875 9.19981H18.5795C17.6728 8.60247 17.2195 7.74381 17.2195 6.62381C17.2195 5.49314 17.6835 4.60247 18.6115 3.95181H20.1155C20.5315 3.95181 20.9208 4.07981 21.2835 4.3358V3.53581C21.2835 3.11981 21.1021 2.84247 20.7395 2.7038H17.8595V1.0238Z"
          fill={`url(#${p3})`}
          shapeRendering="crispEdges"
        />
        <path
          d="M23.9596 9.19981V3.0678H25.5436V9.19981H23.9596ZM23.9596 0.799805H25.5436V2.41981H23.9596V0.799805Z"
          fill={`url(#${p4})`}
          shapeRendering="crispEdges"
        />
        <path
          d="M5.73797 3.98347V1.19981H4.06711V3.99557C4.06711 4.69754 3.92055 5.28251 3.62741 5.75049H2.88621C2.60983 5.29058 2.47164 4.7056 2.47164 3.99557V1.19981H0.800781V3.89875C0.800781 4.50389 0.884533 5.03642 1.05204 5.49633C1.21117 5.95623 1.47499 6.47666 1.84349 7.0576L2.6852 8.37681C2.83596 8.62694 2.99509 8.81251 3.16259 8.93354C3.33009 9.05457 3.54785 9.14333 3.81586 9.19981H5.80078V7.929H4.444C4.26812 7.88059 4.12155 7.79587 4.0043 7.67484C3.88705 7.55381 3.76561 7.38034 3.63998 7.15442L3.5646 7.02129H4.43143C4.83344 6.70661 5.1517 6.28301 5.38621 5.75049C5.62071 5.20989 5.73797 4.62088 5.73797 3.98347Z"
          fill={`url(#${p5})`}
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id={f}
          x="0.000781208"
          y="-0.000195354"
          width="27.1422"
          height="10.7999"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.4" dy="0.4" />
          <feGaussianBlur stdDeviation="0.6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.58 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_144_100" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_144_100" result="shape" />
        </filter>
        <linearGradient id={p0} x1="25.5436" y1="4.99981" x2="0.800781" y2="4.99981" gradientUnits="userSpaceOnUse">
          <stop offset="0.0191086" stopColor="#999999" />
          <stop offset="0.222778" stopColor="white" />
          <stop offset="0.647575" stopColor="white" />
          <stop offset="0.890038" stopColor="white" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={p1} x1="25.5436" y1="4.99981" x2="0.800781" y2="4.99981" gradientUnits="userSpaceOnUse">
          <stop offset="0.0191086" stopColor="#999999" />
          <stop offset="0.222778" stopColor="white" />
          <stop offset="0.647575" stopColor="white" />
          <stop offset="0.890038" stopColor="white" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={p2} x1="25.5436" y1="4.99981" x2="0.800781" y2="4.99981" gradientUnits="userSpaceOnUse">
          <stop offset="0.0191086" stopColor="#999999" />
          <stop offset="0.222778" stopColor="white" />
          <stop offset="0.647575" stopColor="white" />
          <stop offset="0.890038" stopColor="white" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={p3} x1="25.5436" y1="4.99981" x2="0.800781" y2="4.99981" gradientUnits="userSpaceOnUse">
          <stop offset="0.0191086" stopColor="#999999" />
          <stop offset="0.222778" stopColor="white" />
          <stop offset="0.647575" stopColor="white" />
          <stop offset="0.890038" stopColor="white" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={p4} x1="25.5436" y1="4.99981" x2="0.800781" y2="4.99981" gradientUnits="userSpaceOnUse">
          <stop offset="0.0191086" stopColor="#999999" />
          <stop offset="0.222778" stopColor="white" />
          <stop offset="0.647575" stopColor="white" />
          <stop offset="0.890038" stopColor="white" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={p5} x1="25.5436" y1="4.99981" x2="0.800781" y2="4.99981" gradientUnits="userSpaceOnUse">
          <stop offset="0.0191086" stopColor="#999999" />
          <stop offset="0.222778" stopColor="white" />
          <stop offset="0.647575" stopColor="white" />
          <stop offset="0.890038" stopColor="white" stopOpacity="0.16" />
        </linearGradient>
      </defs>
    </svg>
  );
}
