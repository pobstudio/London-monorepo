import styled from 'styled-components';

export const TableContainer = styled.div`
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  min-width: 300px;
`;

export const TableRow = styled.div`
  display: flex;
  padding: 2px 0;
`;

export const TableBody = styled.div`
  padding: 2px 0;
`;
export const TableHeader = styled(TableRow)`
  border-bottom: 1px solid black;
`;

export const TableColumn = styled.div`
  flex-grow: 1;
  padding: 0 12px;
`;
