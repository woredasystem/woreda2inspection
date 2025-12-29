import { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAllNews } from "@/lib/news";
import { NewsForm } from "@/components/admin/NewsForm";
import { HiNewspaper, HiPencilSquare, HiTrash, HiCheckCircle } from "react-icons/hi2";
import Image from "next/image";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { deleteNewsItem } from "@/lib/news-actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Admin : News",
    description: "Manage news and announcements.",
};

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
    const newsList = await getAllNews();

    async function deleteNews(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        await deleteNewsItem(id);
        revalidatePath("/admin/news");
    }

    return (
        <div className="space-y-8">
            <AdminPageHeader
                icon="news"
                titleKey="newsManagement"
                descriptionKey="newsDescription"
                gradient="from-blue-600 to-purple-600"
            />

            {/* Create Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <HiNewspaper className="w-6 h-6 text-indigo-600" />
                    Create New Article
                </h2>
                <div className="max-w-4xl">
                    <NewsForm />
                </div>
            </section>

            <div className="border-t border-slate-200 my-8" />

            {/* List Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Existing News ({newsList.length})</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsList.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            {/* Image */}
                            <div className="relative h-48 w-full bg-slate-100">
                                {item.cover_image_url ? (
                                    <Image
                                        src={item.cover_image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <HiNewspaper className="w-12 h-12" />
                                    </div>
                                )}
                                {item.published && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <HiCheckCircle className="w-3 h-3" /> Published
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="text-xs text-slate-500 mb-2 font-mono">
                                    {format(new Date(item.created_at), "MMM d, yyyy")}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                                    {item.summary || item.content}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-auto">
                                    {/* Edit Button - Ideally would populate form, but for MVP maybe just scroll up or separate edit page. 
                       For now, let's keep it simple: We won't implement full edit-in-place here without client interaction complexity.
                       If the user wants to edit, we might need a separate client component or page. 
                       Given the constraints, I will leave Edit as a TODO or implementing a simple delete.
                   */}
                                    <form action={deleteNews}>
                                        <input type="hidden" name="id" value={item.id} />
                                        <button
                                            type="submit"
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
