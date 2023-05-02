const colorVariants: { [key: string]: string } = {
  red: "fill-red-500",
  orange: "fill-orange-500",
  amber: "fill-amber-500",
  yellow: "fill-yellow-500",
  lime: "fill-lime-500",
  green: "fill-green-500",
  emerald: "fill-emerald-500",
  teal: "fill-teal-500",
  cyan: "fill-cyan-500",
  sky: "fill-sky-500",
  blue: "fill-blue-500",
  indigo: "fill-indigo-500",
  violet: "fill-violet-500",
  purple: "fill-purple-500",
  fuchsia: "fill-fuchsia-500",
  pink: "fill-pink-500",
  rose: "fill-rose-500",
};

export const getColor = (color: string) => {
  return colorVariants[color];
};
