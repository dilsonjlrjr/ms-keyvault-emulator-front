export type Lang = 'en' | 'pt' | 'es';

const dict: Record<string, Record<Lang, string>> = {
	// ── Navigation ──
	'nav.objects': { en: 'Objects', pt: 'Objetos', es: 'Objetos' },
	'nav.secrets': { en: 'Secrets', pt: 'Segredos', es: 'Secretos' },
	'nav.keys': { en: 'Keys', pt: 'Chaves', es: 'Claves' },
	'nav.certificates': { en: 'Certificates', pt: 'Certificados', es: 'Certificados' },
	'nav.integrations': { en: 'Integrations', pt: 'Integrações', es: 'Integraciones' },
	'nav.manage_vaults': { en: 'Manage Vaults', pt: 'Gerenciar Vaults', es: 'Administrar Vaults' },

	// ── Top bar ──
	'bar.local': { en: 'local', pt: 'local', es: 'local' },
	'bar.title': { en: 'Key Vault Emulator', pt: 'Emulador Key Vault', es: 'Emulador Key Vault' },

	// ── Secrets page ──
	'secrets.title': { en: 'Secrets', pt: 'Segredos', es: 'Secretos' },
	'secrets.subtitle': { en: 'Manage secrets stored in your key vault.', pt: 'Gerencie os segredos armazenados no seu cofre.', es: 'Administre los secretos almacenados en su bóveda.' },
	'secrets.total': { en: 'Total Secrets', pt: 'Total de Segredos', es: 'Total de Secretos' },
	'secrets.enabled': { en: 'Enabled', pt: 'Ativos', es: 'Activos' },
	'secrets.disabled': { en: 'Disabled', pt: 'Inativos', es: 'Inactivos' },
	'secrets.empty_title': { en: 'No secrets found', pt: 'Nenhum segredo encontrado', es: 'No se encontraron secretos' },
	'secrets.empty_desc': { en: 'Secrets will appear here once they are created in the vault.', pt: 'Os segredos aparecerão aqui assim que forem criados no cofre.', es: 'Los secretos aparecerán aquí una vez que se creen en la bóveda.' },
	'secrets.th_name': { en: 'Name', pt: 'Nome', es: 'Nombre' },
	'secrets.th_status': { en: 'Status', pt: 'Status', es: 'Estado' },
	'secrets.th_updated': { en: 'Updated', pt: 'Atualizado', es: 'Actualizado' },
	'secrets.th_expiration': { en: 'Expiration', pt: 'Expiração', es: 'Expiración' },
	'secrets.th_value': { en: 'Value', pt: 'Valor', es: 'Valor' },
	'secrets.create': { en: 'Create Secret', pt: 'Criar Segredo', es: 'Crear Secreto' },
	'secrets.name_placeholder': { en: 'Secret name', pt: 'Nome do segredo', es: 'Nombre del secreto' },
	'secrets.value_placeholder': { en: 'Secret value', pt: 'Valor do segredo', es: 'Valor del secreto' },
	'secrets.save': { en: 'Save', pt: 'Salvar', es: 'Guardar' },
	'secrets.cancel': { en: 'Cancel', pt: 'Cancelar', es: 'Cancelar' },
	'secrets.delete_title': { en: 'Delete Secret', pt: 'Excluir Segredo', es: 'Eliminar Secreto' },
	'secrets.delete_confirm': { en: 'Are you sure you want to delete', pt: 'Tem certeza que deseja excluir', es: '¿Está seguro de que desea eliminar' },
	'secrets.delete': { en: 'Delete', pt: 'Excluir', es: 'Eliminar' },
	'secrets.detail.back': { en: 'Back to Secrets', pt: 'Voltar para Segredos', es: 'Volver a Secretos' },
	'secrets.detail.content_type': { en: 'Content Type', pt: 'Tipo de Conteúdo', es: 'Tipo de Contenido' },
	'secrets.detail.created': { en: 'Created', pt: 'Criado', es: 'Creado' },
	'secrets.detail.expires': { en: 'Expires', pt: 'Expira', es: 'Expira' },
	'secrets.detail.not_before': { en: 'Not Before', pt: 'Não Antes', es: 'No Antes' },
	'secrets.detail.tags': { en: 'Tags', pt: 'Tags', es: 'Etiquetas' },
	'secrets.detail.no_tags': { en: 'No tags', pt: 'Sem tags', es: 'Sin etiquetas' },

	// ── Keys page ──
	'keys.title': { en: 'Keys', pt: 'Chaves', es: 'Claves' },
	'keys.subtitle': { en: 'Cryptographic keys stored in your key vault.', pt: 'Chaves criptográficas armazenadas no seu cofre.', es: 'Claves criptográficas almacenadas en su bóveda.' },
	'keys.total': { en: 'Total Keys', pt: 'Total de Chaves', es: 'Total de Claves' },
	'keys.enabled': { en: 'Enabled', pt: 'Ativas', es: 'Activas' },
	'keys.disabled': { en: 'Disabled', pt: 'Inativas', es: 'Inactivas' },
	'keys.empty_title': { en: 'No keys found', pt: 'Nenhuma chave encontrada', es: 'No se encontraron claves' },
	'keys.empty_desc': { en: 'Cryptographic keys will appear here once they are created in the vault.', pt: 'As chaves criptográficas aparecerão aqui assim que forem criadas no cofre.', es: 'Las claves criptográficas aparecerán aquí una vez que se creen en la bóveda.' },
	'keys.th_name': { en: 'Name', pt: 'Nome', es: 'Nombre' },
	'keys.th_status': { en: 'Status', pt: 'Status', es: 'Estado' },
	'keys.th_updated': { en: 'Updated', pt: 'Atualizado', es: 'Actualizado' },
	'keys.th_expiration': { en: 'Expiration', pt: 'Expiração', es: 'Expiración' },

	// ── Certificates page ──
	'certs.title': { en: 'Certificates', pt: 'Certificados', es: 'Certificados' },
	'certs.subtitle': { en: 'Certificates stored in your key vault.', pt: 'Certificados armazenados no seu cofre.', es: 'Certificados almacenados en su bóveda.' },
	'certs.total': { en: 'Total Certificates', pt: 'Total de Certificados', es: 'Total de Certificados' },
	'certs.enabled': { en: 'Enabled', pt: 'Ativos', es: 'Activos' },
	'certs.disabled': { en: 'Disabled', pt: 'Inativos', es: 'Inactivos' },
	'certs.empty_title': { en: 'No certificates found', pt: 'Nenhum certificado encontrado', es: 'No se encontraron certificados' },
	'certs.empty_desc': { en: 'Certificates will appear here once they are created in the vault.', pt: 'Os certificados aparecerão aqui assim que forem criados no cofre.', es: 'Los certificados aparecerán aquí una vez que se creen en la bóveda.' },
	'certs.th_name': { en: 'Name', pt: 'Nome', es: 'Nombre' },
	'certs.th_status': { en: 'Status', pt: 'Status', es: 'Estado' },
	'certs.th_updated': { en: 'Updated', pt: 'Atualizado', es: 'Actualizado' },
	'certs.th_expiration': { en: 'Expiration', pt: 'Expiração', es: 'Expiración' },

	// ── Vaults page ──
	'vaults.title': { en: 'Manage Vaults', pt: 'Gerenciar Vaults', es: 'Administrar Vaults' },
	'vaults.subtitle': { en: 'Create, view, export, and delete key vaults.', pt: 'Crie, visualize, exporte e exclua cofres de chaves.', es: 'Cree, vea, exporte y elimine bóvedas de claves.' },
	'vaults.total': { en: 'Total Vaults', pt: 'Total de Vaults', es: 'Total de Vaults' },
	'vaults.create': { en: 'Create Vault', pt: 'Criar Vault', es: 'Crear Vault' },
	'vaults.name_label': { en: 'Vault Name', pt: 'Nome do Vault', es: 'Nombre del Vault' },
	'vaults.name_placeholder': { en: 'e.g. prod, staging, dev-team', pt: 'ex: prod, staging, dev-team', es: 'ej: prod, staging, dev-team' },
	'vaults.display_label': { en: 'Display Name (optional)', pt: 'Nome de Exibição (opcional)', es: 'Nombre de Visualización (opcional)' },
	'vaults.display_placeholder': { en: 'e.g. Production Vault', pt: 'ex: Vault de Produção', es: 'ej: Bóveda de Producción' },
	'vaults.th_vault': { en: 'Vault', pt: 'Vault', es: 'Vault' },
	'vaults.th_host': { en: 'Host', pt: 'Host', es: 'Host' },
	'vaults.th_actions': { en: 'Actions', pt: 'Ações', es: 'Acciones' },
	'vaults.export': { en: 'Export', pt: 'Exportar', es: 'Exportar' },
	'vaults.delete_vault': { en: 'Delete Vault', pt: 'Excluir Vault', es: 'Eliminar Vault' },
	'vaults.delete_confirm': { en: 'Are you sure you want to delete', pt: 'Tem certeza que deseja excluir', es: '¿Está seguro de que desea eliminar' },
	'vaults.setup_guide': { en: 'Setup Guide', pt: 'Guia de Configuração', es: 'Guía de Configuración' },
	'vaults.vault_created': { en: 'Vault Created', pt: 'Vault Criado', es: 'Vault Creado' },
	'vaults.use_guide': { en: 'Use the guide below to connect your applications to this vault.', pt: 'Use o guia abaixo para conectar suas aplicações a este vault.', es: 'Use la guía a continuación para conectar sus aplicaciones a este vault.' },
	'vaults.dismiss': { en: 'Dismiss', pt: 'Fechar', es: 'Cerrar' },
	'vaults.import': { en: 'Import Vault', pt: 'Importar Vault', es: 'Importar Vault' },
	'vaults.import_title': { en: 'Import Vault', pt: 'Importar Vault', es: 'Importar Vault' },
	'vaults.import_subtitle': { en: 'Upload a vault export JSON file to restore secrets, keys, and certificates.', pt: 'Faça upload de um arquivo JSON de exportação para restaurar segredos, chaves e certificados.', es: 'Suba un archivo JSON de exportación para restaurar secretos, claves y certificados.' },
	'vaults.import_json': { en: 'Import JSON', pt: 'Importar JSON', es: 'Importar JSON' },
	'vaults.importing': { en: 'Importing...', pt: 'Importando...', es: 'Importando...' },
	'vaults.back': { en: 'Back to Vaults', pt: 'Voltar para Vaults', es: 'Volver a Vaults' },

	// ── Integrations page ──
	'integrations.title': { en: 'Integrations', pt: 'Integrações', es: 'Integraciones' },
	'integrations.subtitle': { en: 'How to connect your applications to the Key Vault emulator.', pt: 'Como conectar suas aplicações ao emulador Key Vault.', es: 'Cómo conectar sus aplicaciones al emulador Key Vault.' },
	'integrations.local_setup': { en: 'Local Machine Setup', pt: 'Configuração da Máquina Local', es: 'Configuración de la Máquina Local' },
	'integrations.ca_desc': { en: 'Download the CA certificate and add it to your system trust store:', pt: 'Baixe o certificado CA e adicione-o ao armazenamento de confiança do sistema:', es: 'Descargue el certificado CA y agréguelo al almacén de confianza del sistema:' },
	'integrations.ca_download': { en: 'Download CA Certificate', pt: 'Baixar Certificado CA', es: 'Descargar Certificado CA' },
	'integrations.ca_alt': { en: 'Or copy from the container:', pt: 'Ou copie do container:', es: 'O copie del contenedor:' },
	'integrations.hosts_title': { en: 'DNS Resolution', pt: 'Resolução de DNS', es: 'Resolución de DNS' },
	'integrations.hosts_desc': { en: 'Add the following entries to your hosts file:', pt: 'Adicione as seguintes entradas ao seu arquivo de hosts:', es: 'Agregue las siguientes entradas a su archivo de hosts:' },
	'integrations.hosts_java_title': { en: 'Java — Custom Hosts File', pt: 'Java — Arquivo de Hosts Customizado', es: 'Java — Archivo de Hosts Personalizado' },
	'integrations.hosts_java_desc': { en: 'For Java applications, you can use a custom hosts file instead of editing system files:', pt: 'Para aplicações Java, você pode usar um arquivo de hosts customizado em vez de editar arquivos do sistema:', es: 'Para aplicaciones Java, puede usar un archivo de hosts personalizado en lugar de editar archivos del sistema:' },
	'integrations.spring_config': { en: 'Configuration', pt: 'Configuração', es: 'Configuración' },
	'integrations.spring_code': { en: 'Using Secrets in Code', pt: 'Usando Secrets no Código', es: 'Usando Secretos en Código' },
	'integrations.spring_ca': { en: 'Import CA Certificate', pt: 'Importando Certificado CA', es: 'Importando Certificado CA' },
	'integrations.spring_docker': { en: 'Docker Compose with Spring Boot', pt: 'Docker Compose com Spring Boot', es: 'Docker Compose con Spring Boot' },
	'integrations.go_client': { en: 'HTTP Client with CA Trust', pt: 'Cliente HTTP com Confiança CA', es: 'Cliente HTTP con Confianza CA' },
	'integrations.go_set': { en: 'Set a Secret', pt: 'Criar/Atualizar um Secret', es: 'Crear/Actualizar un Secreto' },
	'integrations.go_encrypt': { en: 'Encrypt / Decrypt with a Key', pt: 'Cifrar / Decifrar com Chave', es: 'Cifrar / Descifrar con Clave' },
	'integrations.go_list': { en: 'List Secrets with Pagination', pt: 'Listar Secrets com Paginação', es: 'Listar Secretos con Paginación' },
	'integrations.env_ref': { en: 'Environment Variables Reference', pt: 'Variáveis de Ambiente de Referência', es: 'Variables de Entorno de Referencia' },
	'integrations.env_var': { en: 'Variable', pt: 'Variável', es: 'Variable' },
	'integrations.env_desc': { en: 'Description', pt: 'Descrição', es: 'Descripción' },
	'integrations.env_default': { en: 'Default', pt: 'Padrão', es: 'Predeterminado' },
	'integrations.compat': { en: 'Verified Compatibility', pt: 'Compatibilidade Verificada', es: 'Compatibilidad Verificada' },
	'integrations.spring_boot': { en: 'Spring Boot', pt: 'Spring Boot', es: 'Spring Boot' },
	'integrations.compatible': { en: 'Compatible', pt: 'Compatível', es: 'Compatible' },

	// ── Error page ──
	'error.not_found': { en: 'Page not found', pt: 'Página não encontrada', es: 'Página no encontrada' },
	'error.go_home': { en: 'Go to Secrets', pt: 'Ir para Segredos', es: 'Ir a Secretos' },
	'error.generic': { en: 'Something went wrong', pt: 'Algo deu errado', es: 'Algo salió mal' },

	// ── Common ──
	'common.enabled': { en: 'Enabled', pt: 'Ativo', es: 'Activo' },
	'common.disabled': { en: 'Disabled', pt: 'Inativo', es: 'Inactivo' },
	'common.delete': { en: 'Delete', pt: 'Excluir', es: 'Eliminar' },
	'common.cancel': { en: 'Cancel', pt: 'Cancelar', es: 'Cancelar' },
	'common.close': { en: 'Close', pt: 'Fechar', es: 'Cerrar' },
	'common.optional': { en: 'optional', pt: 'opcional', es: 'opcional' },
	'common.no_data': { en: '—', pt: '—', es: '—' },
};

export function t(key: string, lang: string): string {
	return (dict[key] as Record<string, string> | undefined)?.[lang] ?? key;
}

export function getLangFromCookie(): Lang | null {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
	const val = match?.[1] as Lang | undefined;
	if (val === 'en' || val === 'pt' || val === 'es') return val;
	return null;
}
