#include <Windows.h>

void KeyPress(int vk) {
	KEYBDINPUT ki = {0};
	INPUT	   in = {0};
	ki.wVk = vk;
	in.type = INPUT_KEYBOARD;
	in.ki = ki;
	SendInput(1, &in, sizeof(in));
	ZeroMemory(&ki, sizeof(ki));
	ZeroMemory(&in, sizeof(in));
	ki.dwFlags = KEYEVENTF_KEYUP;
	ki.wVk = vk;
	in.type = INPUT_KEYBOARD;
	in.ki = ki;
	SendInput(1, &in, sizeof(in));
}

int main(int argc, char** argv) {
	KeyPress(argv[1]);
}
