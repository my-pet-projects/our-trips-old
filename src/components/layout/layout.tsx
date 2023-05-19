import Image from "next/image";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import SideBar from "./side-bar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="min-h-full">
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-100 lg:pt-5 lg:pb-4">
          <div className="flex flex-shrink-0 items-center px-6">
            <Image
              className="h-8 w-auto"
              src="/fil-trips.svg"
              alt="Fil trips"
              height={0}
              width={0}
              priority={true}
            />
          </div>
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <div className="flex flex-col lg:pl-64">
          <div className="lg:hidden">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-1.5">
              <div>
                <Image
                  className="h-8 w-auto"
                  src="/fil-trips.svg"
                  alt="Fil trips"
                  height={0}
                  width={0}
                  priority={true}
                />
              </div>
              <div>
                <button
                  type="button"
                  className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <FaBars className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1">
            <section>{children}</section>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
