import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react"; // Use named import for Link

export default function Dashboard({ users }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="pt-8"  >
                {users.map((user) => (
                    <div className="pt-8" key={user.id}> {/* Add key for each user */}
                        <div className="mx-10px max-w-xl sm:px-6 lg:px-8">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="p-6 text-gray-900 dark:text-gray-100">
                                    <Link href={route('chat' , { id: user.id })}>{user.name}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}   
