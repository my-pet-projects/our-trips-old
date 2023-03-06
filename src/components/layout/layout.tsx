import SideBar from "./side-bar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="min-h-full">
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-100 lg:pt-5 lg:pb-4">
          <div className="flex flex-shrink-0 items-center px-6">
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/workflow-logo-purple-500-mark-gray-700-text.svg"
              alt="Workflow"
            />
          </div>
          <SideBar />
        </div>
        <div className="flex flex-col lg:pl-64">
          <main className="flex-1">
            <section>{children}</section>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
