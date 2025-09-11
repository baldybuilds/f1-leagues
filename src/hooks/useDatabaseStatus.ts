import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useDatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [tablesExist, setTablesExist] = useState<boolean | null>(null)

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('teams').select('count(*)', { count: 'exact', head: true })
        
        if (error) {
          setIsConnected(false)
          setTablesExist(false)
          return
        }

        setIsConnected(true)
        setTablesExist(true)
      } catch (err) {
        setIsConnected(false)
        setTablesExist(false)
      }
    }

    checkDatabaseStatus()
  }, [])

  return { isConnected, tablesExist }
}