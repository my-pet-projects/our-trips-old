import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (pageNum: number) => void;
}> = function (props) {
  const totalPages = Math.ceil(props.totalItems / props.pageSize);
  const firstPage = props.currentPage === 1;
  const lastPage = props.currentPage === totalPages;
  const pages = [...Array(totalPages).keys()].map((i) => i + 1);

  const doPagination = (pageNum: number) => {
    if (pageNum <= 0) {
      props.onPageChange(1);
      return;
    }
    if (pageNum > totalPages) {
      props.onPageChange(totalPages);
      return;
    }
    props.onPageChange(pageNum);
  };

  const onPrevious = (): void => {
    if (firstPage) {
      return;
    }
    doPagination(props.currentPage - 1);
  };

  const onNext = (): void => {
    if (lastPage) {
      return;
    }
    doPagination(props.currentPage + 1);
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 px-6">
      <div className="flex flex-1 items-center justify-center">
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            {!firstPage && (
              <a
                href="#"
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => onPrevious()}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" />
              </a>
            )}
            {pages &&
              pages.map((pageNum) => {
                if (
                  pageNum === 1 ||
                  (pageNum === 2 && props.currentPage === 4) ||
                  pageNum === props.currentPage ||
                  pageNum === props.currentPage - 1 ||
                  pageNum === props.currentPage + 1 ||
                  (pageNum === totalPages - 1 &&
                    props.currentPage === totalPages - 3) ||
                  pageNum === totalPages
                ) {
                  return (
                    <a
                      href="#"
                      key={pageNum}
                      onClick={() => doPagination(pageNum)}
                      className={
                        pageNum === props.currentPage
                          ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }
                    >
                      {pageNum}
                    </a>
                  );
                }

                if (
                  pageNum === props.currentPage - 2 ||
                  pageNum === props.currentPage + 2
                ) {
                  return (
                    <a
                      key={pageNum}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900"
                    >
                      ...
                    </a>
                  );
                }
              })}
            {!lastPage && (
              <a
                href="#"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => onNext()}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" />
              </a>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
