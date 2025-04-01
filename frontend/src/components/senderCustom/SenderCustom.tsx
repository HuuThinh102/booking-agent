import { Sender } from '@ant-design/x';
import { Flex } from 'antd';
import { useState } from 'react';
import styles from './SenderCustom.module.scss';

interface SenderCustomProps {
    onSubmit: (message: string) => void;
}

const SenderCustom = ({ onSubmit }: SenderCustomProps) => {

    const [value, setValue] = useState('');

    const handleSubmit = (message: string) => {
        onSubmit(message);
        setValue('');
    };

    return (
        <Flex align="end">
            <Sender
                value={value}
                onChange={setValue}
                placeholder="Ask me anything about booking room"
                onSubmit={handleSubmit}
                className={styles.sender}
            />
        </Flex>
    );
}

export default SenderCustom