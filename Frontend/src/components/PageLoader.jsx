// Shown while a lazily loaded page (or the auth check) is in progress
const PageLoader = () => (
    <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
);

export default PageLoader;
