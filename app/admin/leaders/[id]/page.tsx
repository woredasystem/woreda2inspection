import { LeaderForm } from "@/components/admin/LeaderForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getLeader } from "@/lib/leader-actions";

export default async function EditLeaderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const leader = await getLeader(id);

    if (!leader) return <div>Not found</div>;

    return (
        <div className="space-y-8">
            <AdminPageHeader
                icon="edit"
                titleKey="editLeader"
                descriptionKey="editLeaderDesc"
                gradient="from-orange-500 to-red-600"
            />
            <div className="max-w-4xl mx-auto">
                <LeaderForm initialData={leader} />
            </div>
        </div>
    )
}
