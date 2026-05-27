import { Modal } from '../../../components';
import { StudentProfileContent } from './StudentProfileContent';

interface StudentProfileModalProps {
  studentId: string;
  open:      boolean;
  onClose:   () => void;
}

export function StudentProfileModal({ studentId, open, onClose }: StudentProfileModalProps) {
  return (
    <Modal title="Student Profile" open={open} onClose={onClose} width="max-w-4xl min-h-[90vh]">
      <StudentProfileContent studentId={studentId} onClose={onClose} />
    </Modal>
  );
}
