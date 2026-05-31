import { motion } from 'framer-motion'
import PageHeader from '../design-system/PageHeader'
import Badge from '../design-system/Badge'
import UserProfileSettings from '../components/settings/UserProfileSettings'
import NotificationSettings from '../components/notifications/NotificationSettings'
import MuralPresenceSettings from '../components/settings/MuralPresenceSettings'

export default function SettingsPage() {
  return (
    <div className="px-4 py-8 md:px-8 lg:px-12">
      <PageHeader
        badge={
          <Badge>
            <span>Preferências</span>
          </Badge>
        }
        title="Configurações"
        subtitle="Gerencie seus dados pessoais, lembretes do mural e notificações do navegador."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        <UserProfileSettings />
        <MuralPresenceSettings />
        <NotificationSettings />
      </motion.div>
    </div>
  )
}
