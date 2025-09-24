'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
  totalPages: number;
}

const InsightsPaginationControls = ({ totalPages }: Props) => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ?? '1';
  const currentPage = Number(page);

  const getVisiblePages = () => {
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const pages = getVisiblePages();

  return (
    <nav aria-label="Pagination">
      <div className="flex items-center justify-center space-x-4">
        {/* Left Arrow */}
        <Link
          href={`/insights?page=${currentPage - 1}`}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 pointer-events-none'
              : 'bg-gray-800 hover:bg-fuchsia-500 text-white'
          }`}
          aria-disabled={currentPage === 1}
        >
          <span className="sr-only">Previous Page</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Page Numbers */}
        <div className="flex items-center space-x-2">
          {pages.map((p) => (
            <Link
              key={p}
              href={`/insights?page=${p}`}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                currentPage === p
                  ? 'bg-fuchsia-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              aria-current={currentPage === p ? 'page' : undefined}
            >
              {p}
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <Link
          href={`/insights?page=${currentPage + 1}`}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 pointer-events-none'
              : 'bg-gray-800 hover:bg-fuchsia-500 text-white'
          }`}
          aria-disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next Page</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </nav>
  );
};

export default InsightsPaginationControls;