#!/usr/bin/env bash
# Gera os certificados SSL exigidos pelo Azure Key Vault Emulator
# (jamesgoulddev/azure-keyvault-emulator) usando openssl.
#
# Limitação do emulador: o nome E a senha do certificado DEVEM ser "emulator".
#
# Uso:
#   ./scripts/generate-certs.sh [diretório-de-saída]
#
# Padrão do diretório de saída: ./certs (montado pelo docker-compose em /certs)

set -e

OUT_DIR="${1:-./certs}"
PASSWORD="emulator"

mkdir -p "$OUT_DIR"
cd "$OUT_DIR"

if [ -f emulator.pfx ] && [ -f emulator.crt ]; then
	echo "Certificados já existem em '$OUT_DIR' (emulator.pfx / emulator.crt)."
	echo "Apague-os antes de rodar este script novamente, se quiser regenerar."
	exit 0
fi

echo "Gerando certificados em '$OUT_DIR' usando openssl..."

CONFIG=$(cat <<EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = san
prompt = no

[req_distinguished_name]
CN = localhost

[san]
subjectAltName = DNS:localhost, DNS:emulator, DNS:localhost.vault.azure.net
EOF
)

openssl req \
	-x509 \
	-newkey rsa:4096 \
	-passin pass:$PASSWORD \
	-sha256 \
	-days 3560 \
	-nodes \
	-keyout emulator.key \
	-out emulator.crt \
	-subj '/CN=localhost' \
	-extensions san \
	-config <(echo -n "$CONFIG")

echo "emulator.key e emulator.crt gerados. Criando emulator.pfx..."

openssl pkcs12 -export \
	-out emulator.pfx \
	-inkey emulator.key \
	-in emulator.crt \
	-passin pass:$PASSWORD \
	-passout pass:$PASSWORD \
	-name "Azure Key Vault Emulator"

echo
echo "Certificados criados em '$OUT_DIR':"
echo "  - emulator.key  (chave privada)"
echo "  - emulator.crt  (certificado público)"
echo "  - emulator.pfx  (senha: $PASSWORD)"
echo
echo "Próximo passo: instale 'emulator.crt' (ou .pfx no Windows) como Trusted Root CA"
echo "no seu sistema operacional. Veja o README.md para os comandos por SO."
