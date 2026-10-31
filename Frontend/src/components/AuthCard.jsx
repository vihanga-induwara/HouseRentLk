// Centered card used by the small account pages (forgot/reset password, verify email)
const AuthCard = ({ icon: Icon, title, subtitle, children }) => (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 w-full max-w-md">
            <div className="text-center mb-8">
                {Icon && (
                    <div className="bg-primary-50 p-3 rounded-full inline-block mb-4">
                        <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
            </div>
            {children}
        </div>
    </div>
);

export default AuthCard;
