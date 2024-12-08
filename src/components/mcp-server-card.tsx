import { TerminalCommand } from "@/components/terminal-command"
import { SERVER_CONFIGS } from "@/server-configs"
import { capitalizeFirstLetter } from "@/utils"
import { ArrowUpRight, Trash2 } from "lucide-react"
import { useState } from "react"

type MCPServerConfig = {
	command: string
	args: string[]
}

type MCPServerCardProps = {
	serverName: string
	config: MCPServerConfig
	icon?: string
	variables?: {
		name: string
		value: string
		argIndex: number
	}[]
	onUpdate: (name: string, newConfig: MCPServerConfig) => void
	onDelete: (name: string) => void
}

export function MCPServerCard({
	serverName,
	config,
	icon,
	variables,
	onUpdate,
	onDelete
}: MCPServerCardProps) {
	const [values, setValues] = useState<Record<string, string>>(() => {
		if (!variables) return {}
		const initialValues: Record<string, string> = {}
		for (const v of variables) {
			initialValues[v.name] = v.value
		}
		return initialValues
	})

	const handleVariableChange = (
		name: string,
		value: string,
		_argIndex: number
	) => {
		setValues((prev) => ({ ...prev, [name]: value }))

		// Update parent immediately
		const newConfig = { ...config }
		if (variables) {
			for (const v of variables) {
				newConfig.args[v.argIndex] =
					v.name === name ? value : values[v.name]
			}
		}
		onUpdate(serverName, newConfig)
	}

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDelete(serverName)
	}

	// Get the server config to check for terminal command
	const serverConfig =
		SERVER_CONFIGS[serverName as keyof typeof SERVER_CONFIGS]
	const hasTerminalCommand = Boolean(serverConfig?.terminalCommand)

	// Get the server config at the start of the component
	const iconUrl = icon || serverConfig?.icon // Use the prop or fallback to config

	return (
		<div className="join join-vertical w-full">
			<div className="collapse collapse-arrow join-item border border-base-300 bg-white p-4">
				<input type="checkbox" defaultChecked />
				<div className="collapse-title">
					<div className="flex items-center">
						<div className="flex items-center gap-2">
							{iconUrl && (
								<img
									src={iconUrl}
									alt={`${serverName} icon`}
									className="w-20 h-12 object-contain"
									onError={(e) => {
										// Fallback if image fails to load
										e.currentTarget.style.display = "none"
									}}
								/>
							)}
							<h3 className="text-lg capitalize">{serverName}</h3>
						</div>
					</div>
				</div>
				<div className="collapse-content">
					{hasTerminalCommand ? (
						<div className="bg-base-200 rounded-xl p-4 space-y-4">
							<p className="text-sm text-gray-600">
								MCP Manager can't update this server directly,
								please run this terminal command to modify this
								server.
							</p>
							<TerminalCommand
								command={serverConfig?.terminalCommand}
							/>
						</div>
					) : (
						variables && (
							<div className="bg-base-200 rounded-xl p-4">
								<div className="space-y-4">
									{variables.map((variable) => (
										<div
											key={variable.name}
											className="form-control"
										>
											<label
												className="label"
												htmlFor={`${serverName}-${variable.name}`}
											>
												<span className="label-text">
													{variable.name}
												</span>
											</label>
											<input
												id={`${serverName}-${variable.name}`}
												type="text"
												value={values[variable.name]}
												onChange={(e) =>
													handleVariableChange(
														variable.name,
														e.target.value,
														variable.argIndex
													)
												}
												className="input input-bordered w-full"
												placeholder={`Enter ${capitalizeFirstLetter(serverName)} ${variable.name}`}
											/>
										</div>
									))}
								</div>
							</div>
						)
					)}
				</div>
				<div className="flex justify-end">
					<div className="flex gap-2 mb-4 mr-2">
						<button
							type="button"
							onClick={() =>
								window.open(serverConfig?.docsUrl, "_blank")
							}
							className="btn btn-sm btn-secondary"
						>
							<ArrowUpRight className="w-4 h-4" />
							<span>Docs</span>
						</button>
					</div>
					<div className="flex gap-2 mb-4 mr-4 justify-end">
						<button
							type="button"
							onClick={handleDelete}
							className="btn btn-sm bg-red-50 hover:bg-red-100"
						>
							<Trash2 className="w-4 h-4" />
							<span>Delete</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
