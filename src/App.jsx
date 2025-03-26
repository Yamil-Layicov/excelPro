import { useState } from 'react';
import { staticData as initialData } from './data/staticData';
import Table from './components/Table';
import AddDataModal from './components/AddDataModal';

function App() {
  const [data, setData] = useState(initialData);
  const [openModal, setOpenModal] = useState(false);

  const handleAddData = (newData) => {
    setData((prevData) => [...prevData, newData]);
    setOpenModal(false);
  };

  const handleDelete = (id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  const handleUpdate = (updatedRow) => {
    setData((prevData) =>
      prevData.map((item) => (item.id === updatedRow.id ? updatedRow : item))
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cədvəl</h1>
      <Table
        data={data}
        onOpenModal={() => setOpenModal(true)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
      {openModal && (
        <AddDataModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onAddData={handleAddData}
        />
      )}
    </div>
  );
}

export default App;