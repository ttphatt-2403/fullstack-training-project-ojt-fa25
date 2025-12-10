import React, { useEffect } from 'react';
import { Card, Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  const handleBackToFees = () => {
    navigate('/user/fees');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: '600px', width: '100%' }}>
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle="Giao dịch của bạn đã bị hủy hoặc không thành công. Vui lòng thử lại."
          extra={[
            <Button
              key="back"
              type="primary"
              onClick={handleBackToFees}
            >
              Quay lại trang phí
            </Button>
          ]}
        />

      </Card>
    </div>
  );
};

export default PaymentCancelPage;