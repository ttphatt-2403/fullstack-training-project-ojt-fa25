import React, { useEffect } from 'react';
import { Card, Button, Result, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { authService } from '../../services/authService';

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verify payment and update DB if needed
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

    if (vnp_ResponseCode === '00' && vnp_TxnRef) {
      // Call backend to update DB (simulate IPN)
      updatePaymentStatus(vnp_TxnRef);
    }
  }, [searchParams]);

  const updatePaymentStatus = async (feeId) => {
    try {
      const result = await feeService.confirmVNPayPayment(feeId, Object.fromEntries(searchParams));
      message.success('Thanh toán thành công!');
    } catch (error) {
      console.error('Update payment error:', error);
      message.error('Có lỗi khi cập nhật thanh toán');
    }
  };

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
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          status="success"
          title="Thanh toán thành công!"
          subTitle="Phí của bạn đã được thanh toán thành công qua VNPay."
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

        {/* Optional: Show payment details */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Bạn sẽ được chuyển hướng về trang quản lý phí trong giây lát...
          </p>
        </div>
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;
