# Website Hoàn Chỉnh - CLB Hiến Máu

## Các trang đã tạo

### Public (User)
- `index.html` - Trang chủ khách
- `programs.html` - Danh sách chương trình hiến máu
- `register.html` - Form đăng ký hiến máu
- `lookup.html` - Tra cứu lịch sử theo CCCD/SDT
- `login.html` - Đăng nhập cho Admin/Member

### Admin
- `admin/dashboard.html` - Bảng quản trị tổng quan
- `admin/members.html` - Quản lý thành viên
- `admin/programs.html` - Quản lý chương trình
- `admin/registrations.html` - Duyệt đăng ký hiến máu
- `admin/notifications.html` - Tạo/gửi thông báo 
- `admin/accounts.html` - Tạo tài khoản + cấp lại mật khẩu

### Member
- `member/dashboard.html` - Bảng điều khiển thành viên
- `member/profile.html` - Hồ sơ cá nhân
- `member/notifications.html` - Thông báo
- `member/history.html` - Lịch sử hiến máu

## Tài khoản mặc định
- Admin: admin@uhs.edu.vn / 12345678
- Member: member1@uhs.edu.vn / 12345678

## Chức năng đã triển khai theo use case
- User (không cần đăng nhập): xem chương trình, đăng ký hiến máu, tra cứu lịch sử.
- Admin: quản lý thành viên, chương trình, duyệt/từ chối đăng ký, đánh dấu tham gia thực tế, quản lý thông báo, tạo tài khoản member, cấp lại mật khẩu.
- Member: xem dashboard, cập nhật thông tin cá nhân, xem/đánh dấu đã xem thông báo, xem lịch sử hiến máu.

## Chạy nhanh
Mở file `index.html` bằng browser để sử dụng hệ thống.

## Lưu ý kỹ thuật
- Dữ liệu được lưu bền vững trong LocalStorage trình duyệt.
- Khi có Node/PostgreSQL, có thể thay lớp lưu trữ này bằng backend API mà không đổi giao diện.





