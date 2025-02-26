from django.test import TestCase, Client
from .models import User

# Create your tests here.
class UserAuthTest(TestCase):
    def setUp(self):
        # 테스트용 사용자 생성
        self.user = User.objects.create_user(email="testuser@test.com", password="password123")


    def test_login_success(self):
        """
            로그인 성공
        """
        # 로그인 요청
        response = self.client.post("/login/", {"email": "testuser@test.com", "password": "password123"})
        
        # 리디렉션 상태 체크 (로그인 성공 시 리디렉트 되어야 함)
        self.assertEqual(response.status_code, 302)
        
        # 세션에 유저 ID가 저장되었는지 확인
        self.assertIn("_auth_user_id", self.client.session)

    def test_login_failure(self):
        """
            로그인 실패
        """
        response = self.client.post("/login/", {"email": "testuser@test.com", "password": "wrongpass"})
        self.assertEqual(response.status_code, 200)  # 로그인 실패 시 같은 페이지 유지
        self.assertContains(response, "로그인 정보가 틀렸습니다.")  # 에러 메시지 포함

    def test_logout(self):
        """
            로그아웃 성공
        """
        self.client.login(email="testuser@test.com", password="password123")
        response = self.client.get("/logout/")
        self.assertNotIn("_auth_user_id", self.client.session)  # 세션이 삭제됨
