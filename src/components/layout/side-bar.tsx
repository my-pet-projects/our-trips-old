import {
  BriefcaseIcon,
  BuildingLibraryIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  {
    name: "Attractions",
    href: "/admin/attraction",
    icon: BuildingLibraryIcon,
  },
  { name: "Trips", href: "/admin/trips", icon: BriefcaseIcon },
];

const SideBar: React.FC = () => {
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <nav className="mt-6 px-3">
      <div className="space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              currentRoute === item.href
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
            )}
          >
            <item.icon
              className={classNames(
                currentRoute === item.href
                  ? "text-gray-500"
                  : "text-gray-400 group-hover:text-gray-500",
                "mr-3 h-6 w-6 flex-shrink-0"
              )}
            />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SideBar;
