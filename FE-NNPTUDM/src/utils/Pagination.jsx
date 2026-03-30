export default function Pagination({ pagination, page, setSearchParams }) {
  return (
    <div className="mt-10 flex justify-center gap-3">
      {Array.from({ length: pagination?.total_pages || 1 }, (_, i) => {
        const pageNumber = i + 1;

        return (
          <button
            key={pageNumber}
            onClick={() => {
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);

                if (pageNumber === 1) {
                  params.delete("page");
                } else {
                  params.set("page", String(pageNumber));
                }

                return params;
              });
            }}
            className={`cursor-pointer rounded-lg px-4 py-2 ${
              page === pageNumber
                ? "bg-white text-black"
                : "bg-[#111317] text-white"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}
    </div>
  );
}
