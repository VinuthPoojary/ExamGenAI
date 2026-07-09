const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const JDK_URL = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.8.1%2B1/OpenJDK17U-jdk_x64_linux_hotspot_17.0.8.1_1.tar.gz';
const BIN_DIR = path.join(__dirname, '..', 'bin');
const JDK_DIR = path.join(BIN_DIR, 'jdk17');

const installJdk = async () => {
    if (process.platform === 'win32') {
        console.log('Skipping JDK installation on Windows.');
        return;
    }

    if (fs.existsSync(path.join(JDK_DIR, 'bin', 'javac'))) {
        console.log('JDK is already installed.');
        return;
    }

    console.log('JDK not found, downloading portable JDK for Render...');
    if (!fs.existsSync(BIN_DIR)) {
        fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    const tarPath = path.join(BIN_DIR, 'jdk.tar.gz');
    try {
        console.log(`Downloading OpenJDK from ${JDK_URL}...`);
        execSync(`curl -L "${JDK_URL}" -o "${tarPath}"`, { stdio: 'inherit' });

        console.log('Extracting JDK...');
        execSync(`tar -xzf "${tarPath}" -C "${BIN_DIR}"`, { stdio: 'inherit' });

        const dirs = fs.readdirSync(BIN_DIR).filter(f => f.startsWith('jdk-') && fs.statSync(path.join(BIN_DIR, f)).isDirectory());
        if (dirs.length > 0) {
            fs.renameSync(path.join(BIN_DIR, dirs[0]), JDK_DIR);
            console.log(`Successfully renamed ${dirs[0]} to jdk17`);
        }

        console.log('JDK installed successfully at:', JDK_DIR);
    } catch (err) {
        console.error('Failed to download/install JDK:', err);
    } finally {
        if (fs.existsSync(tarPath)) {
            try {
                fs.unlinkSync(tarPath);
            } catch (e) {
                // Ignore unlink errors
            }
        }
    }
};

installJdk();
