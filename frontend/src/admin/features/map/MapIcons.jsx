import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPinIcon } from "@heroicons/react/24/solid";

const riskMarkers = [
  {
    riskLevel: "low",
    markerAnimation: "animate-risk-low",
    markerColor: "text-green-500",
    markerBorder: "text-green-700",
    markerShadow: "bg-green-300",
  },
  {
    riskLevel: "moderate",
    markerAnimation: "animate-risk-moderate",
    markerColor: "text-yellow-500",
    markerBorder: "text-yellow-700",
    markerShadow: "bg-yellow-300",
  },
  {
    riskLevel: "high",
    markerAnimation: "animate-risk-high",
    markerColor: "text-orange-500",
    markerBorder: "text-orange-700",
    markerShadow: "bg-orange-300",
  },
  {
    riskLevel: "critical",
    markerAnimation: "animate-risk-critical",
    markerColor: "text-red-600",
    markerBorder: "text-red-800",
    markerShadow: "bg-red-400",
  },
  {
    riskLevel: "catastrophic",
    markerAnimation: "animate-risk-catastrophic",
    markerColor: "text-red-800",
    markerBorder: "text-red-950",
    markerShadow: "bg-red-500",
  },
  {
    riskLevel: "none",
    markerAnimation: "",
    markerColor: "text-gray-400",
    markerBorder: "text-gray-600",
  },
];
export const MapIcons = (riskLevel) => {
  const normalizedRisk = String(riskLevel || "none").toLowerCase();

  const marker =
    riskMarkers.find((item) => item.riskLevel === normalizedRisk) ||
    riskMarkers.find((item) => item.riskLevel === "none");

  return L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative flex h-9 w-9 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full ${
            marker.markerShadow
          } ${marker.markerAnimation || ""}`}
        />

        <MapPinIcon
          className={`absolute z-10 h-9 w-9 ${marker.markerBorder}`}
        />

        <MapPinIcon className={`absolute z-20 h-8 w-8 ${marker.markerColor}`} />
      </div>,
    ),

    className: "",

    iconSize: [36, 36],

    iconAnchor: [18, 36],

    popupAnchor: [0, -36],
  });
};

export default MapIcons;
