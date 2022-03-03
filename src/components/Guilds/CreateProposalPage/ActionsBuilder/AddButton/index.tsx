import { IconButton } from 'components/Guilds/common/Button';
import { AiOutlinePlus } from 'react-icons/ai';
import styled from 'styled-components';
interface ActionButtonProps {
  label: string;
  onClick?: () => void;
}

const StyledIconButton = styled(IconButton)`
  padding: 0.6rem 1.25rem;
  margin: 0.5rem 0;
`;

const AddButton: React.FC<ActionButtonProps> = ({ label, onClick }) => {
  return (
    <StyledIconButton iconLeft onClick={onClick}>
      <AiOutlinePlus /> {label}
    </StyledIconButton>
  );
};

export default AddButton;
