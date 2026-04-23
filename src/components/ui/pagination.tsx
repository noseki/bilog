interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export const Pagination = ({ currentPage, totalPages, onPrev, onNext }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        前へ
      </button>
      <span className="text-sm text-gray-500">{currentPage} / {totalPages}</span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        次へ
      </button>
    </div>
  );
};
