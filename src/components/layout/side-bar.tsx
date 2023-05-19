import { Dialog, Transition } from "@headlessui/react";
import {
  BriefcaseIcon,
  BuildingLibraryIcon,
  HomeIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  {
    name: "Attractions",
    href: "/admin/attraction",
    icon: BuildingLibraryIcon,
  },
  { name: "Trips", href: "/admin/trips", icon: BriefcaseIcon },
  { name: "Plan", href: "/admin/plans", icon: MapIcon },
];

const SideBar = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}) => {
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <FaTimes
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>

              <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <Image
                    className="h-8 w-auto"
                    src="/fil-trips.svg"
                    alt="Fil trips"
                    height={0}
                    width={0}
                    priority={true}
                  />
                </div>
                <nav aria-label="Sidebar" className="mt-5">
                  <div className="space-y-1 px-2">
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
              </div>
            </div>
          </Transition.Child>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

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
    </>
  );
};

export default SideBar;
