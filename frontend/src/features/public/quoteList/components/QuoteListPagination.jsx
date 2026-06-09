export default function QuoteListPagination({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="quote-list-pagination">
      <button
        type="button"
        className="quote-list-page-button"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        ←
      </button>

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          className={`quote-list-page-number ${
            currentPage === pageNumber ? "is-active" : ""
          }`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        className="quote-list-page-button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        →
      </button>
    </div>
  );
}
