import React, { useEffect, useState } from 'react';
import { Card, Button, Result, Typography, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { feeService } from '../../services/feeService';

const { Title, Text } = Typography;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnpResponseCode = urlParams.get('vnp_ResponseCode');

    // Check response code - chỉ confirm nếu thành công
    if (vnpResponseCode !== '00') {
      navigate('/payment/cancel');
      return;
    }

    const confirmPayment = async () => {
      try {
        const vnpTxnRef = urlParams.get('vnp_TxnRef');
        if (!vnpTxnRef) {
          console.error('Missing vnp_TxnRef');
          return;
        }

        const feeId = parseInt(vnpTxnRef);
        const response = await feeService.confirmVNPayPayment(feeId);

        if (response.data.success) {
          setConfirmed(true);
          message.success('Thanh toán đã được xác nhận thành công!');
        } else {
          message.warning(response.data.message || 'Thanh toán đã được xử lý trước đó');
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        message.error('Có lỗi xảy ra khi xác nhận thanh toán');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [navigate]);

  const handleBackToFees = () => {
    navigate('/user/fees');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Đang xác nhận thanh toán...</Text>
          </div>
        </Card>
      </div>
    );
  }

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
          status="success"
          title="Thanh toán thành công!"
          subTitle={confirmed ? "Giao dịch đã được xác nhận và cập nhật vào hệ thống." : "Giao dịch đã hoàn tất."}
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

export default PaymentSuccessPage;