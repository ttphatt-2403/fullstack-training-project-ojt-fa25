import React from 'react';
import { Card, Button, Result } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function PaymentCancelPage() {
  const navigate = useNavigate();

  const handleBackToFees = () => {
    navigate('/user/fees');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      padding: '24px'
    }}>
      <Card style={{ maxWidth: '600px', width: '100%' }}>
        <Result
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          status="error"
          title="Thanh toán thất bại!"
          subTitle="Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
          extra={[
            <Button
              type="primary"
              key="back"
              size="large"
              onClick={handleBackToFees}
            >
              Quay về trang phí
            </Button>
          ]}
        />

        {/* Optional: Show error details */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Nếu bạn đã thực hiện thanh toán, vui lòng liên hệ hỗ trợ.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default PaymentCancelPage;
