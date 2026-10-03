import { PageHeader } from "@/components/shared/page-header"
import { ComingSoon } from "@/components/shared/coming-soon"

export function OperationsPlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <ComingSoon title={`${title} is coming soon`} />
    </div>
  )
}

export default OperationsPlaceholderPage
