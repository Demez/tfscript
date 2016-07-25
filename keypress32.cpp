#define WINVER 0x0500
#include <Windows.h>

void KeyPress(DWORD s) {
	KEYBDINPUT ki = {0};
	INPUT	   in;
	in.ki.dwFlags = KEYEVENTF_SCANCODE;
	in.ki.wScan = s; 
	in.ki.time = 0;
	in.ki.wVk = s;
	in.ki.dwExtraInfo = 0;
	in.type = INPUT_KEYBOARD;
	SendInput(1, &in, sizeof(in));
	in.ki.dwFlags = KEYEVENTF_KEYUP | KEYEVENTF_SCANCODE;
	SendInput(1, &in, sizeof(in));
}

int main(int argc, char** argv) {
	KeyPress(atoi(argv[1]));
}
