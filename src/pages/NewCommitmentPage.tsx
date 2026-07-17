import { useNavigate } from 'react-router-dom'
import { CommitmentForm } from '../components/commitments/CommitmentForm.tsx'
import { Layout } from '../components/layout/Layout.tsx'

export function NewCommitmentPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <CommitmentForm
        onSuccess={() => navigate('/commitments')}
        onCancel={() => navigate('/commitments')}
      />
    </Layout>
  )
}
