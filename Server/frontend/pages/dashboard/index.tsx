import { Inter } from 'next/font/google'
import { Dashboard, Box } from '@/components/Dashboard'

const inter = Inter({ subsets: ['latin'] })

const DashboardPage: React.FC = () => {
    return (
      <main>
        <Dashboard>
          <Box title="Box 1">
            {/* Add box 1 content here */}
          </Box>
          <Box title="Box 2">
            {/* Add box 2 content here */}
          </Box>
          {/* Add more box components as needed */}
        </Dashboard>
      </main>
    );
};

export default DashboardPage;