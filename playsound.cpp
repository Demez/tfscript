#include <Windows.h>

int main (int argc, char** argv) {
	PlaySound(argv[1], NULL, SND_FILENAME);
}
