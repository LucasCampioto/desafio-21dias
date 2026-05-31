import ChatWindow from '../components/assistant/ChatWindow'
import PageHeader from '../design-system/PageHeader'
import Badge from '../design-system/Badge'

export default function AssistantPage() {
  return (
    <div className="px-4 py-8 md:px-8 lg:px-12">
      <PageHeader
        badge={
          <Badge pulse>
            <span>Assistente pessoal</span>
          </Badge>
        }
        title="Aurora"
        subtitle="Uma presença calma e inteligente para refletir com você sobre sua jornada."
      />
      <ChatWindow />
    </div>
  )
}
