import Link from "next/link";
import Image from "next/image";
import { getAdminLeaders, deleteLeader } from "@/lib/leader-actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HiPlus, HiPencilSquare, HiTrash, HiUser } from "react-icons/hi2";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminLeadersPage() {
    const leaders = await getAdminLeaders();

    async function deleteLeaderAction(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        await deleteLeader(id);
        revalidatePath("/admin/leaders");
    }

    return (
        <div className="space-y-8">
            <AdminPageHeader
                icon="users"
                titleKey="leadersManagement"
                descriptionKey="leadersDescription"
                gradient="from-blue-600 to-purple-600"
            />

            <div className="flex justify-end">
                <Link href="/admin/leaders/new" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30">
                    <HiPlus className="w-5 h-5" />
                    Add New Member
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaders.map(leader => (
                    <div key={leader.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="relative h-64 w-full bg-slate-100">
                            {leader.photo_url ? (
                                <Image src={leader.photo_url} alt={leader.name} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <HiUser className="w-20 h-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                <h3 className="font-bold text-lg">{leader.name}</h3>
                                <p className="text-sm opacity-90">{leader.title}</p>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {leader.category.replace(/-/g, ' ')}
                            </div>
                        </div>

                        <div className="p-4 flex items-center justify-between mt-auto bg-slate-50 border-t border-slate-100">
                            <div className="text-xs font-bold text-slate-500">
                                Order: {leader.sort_order}
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/admin/leaders/${leader.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                    <HiPencilSquare className="w-5 h-5" />
                                </Link>
                                <form action={deleteLeaderAction}>
                                    <input type="hidden" name="id" value={leader.id} />
                                    <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}

                {leaders.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <HiUser className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                        <p className="text-lg font-medium">No leaders found</p>
                        <p className="text-sm">Add a new member to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
