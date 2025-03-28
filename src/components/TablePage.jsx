import { useState } from 'react';
import Table from './Table';
import AddDataModal from './AddDataModal';

function TablePage({ data, onAddData, onDelete, onUpdate }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cədvəl</h1>
      <Table
        data={data}
        onOpenModal={() => setOpenModal(true)}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
      {openModal && (
        <AddDataModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onAddData={onAddData}
        />
      )}
    </div>
  );
}

export default TablePage;