import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFound() {
	const navigate = useNavigate();
	return (
		<div style={{ padding: 40, textAlign: 'center' }}>
			<h1>404 — Không tìm thấy trang</h1>
			<p>Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.</p>
			<Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>
		</div>
	);
}

export default NotFound;
