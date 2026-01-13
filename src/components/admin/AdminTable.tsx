import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TableList2 from '../ui/data-table2';

const AdminTable = ({ data, columns, onAddClick, inputPlaceholder }) => (
  <TableList2
    data={data}
    columns={columns}
    showSearchInput
    rightElements={
      <Button onClick={onAddClick}>
        <Plus /> New Role Map
      </Button>
    }
    showFilter={false}
    inputPlaceholder={inputPlaceholder}
  />
);

export default AdminTable;
