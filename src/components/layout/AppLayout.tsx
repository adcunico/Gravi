import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-midnight">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-64 xl:pl-72 pb-20 lg:pb-0 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
