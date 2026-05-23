import { useEffect } from "react";
import {
	LegalLayout,
	Sec,
	Sub,
	P,
	Ul,
	Ol,
	LegalTable,
} from "../components/legal/LegalLayout";

export default function DataPolicy() {
	useEffect(() => {
		document.title = "Data Processing Agreement   AralSync";
	}, []);

	return (
		<LegalLayout
			title="Data Processing Agreement"
			subtitle="The formal agreement between AralSync (Processor) and the school or teacher (Controller) under RA 10173."
			version="1.0"
			effectiveDate="May 25, 2026"
		>
			<P>
				This Data Processing Agreement ("Agreement" or "DPA") is entered
				into between:
			</P>
			<Ul>
				<li>
					<strong>The Controller</strong> the teacher, school, or
					educational institution that has accepted AralSync's Terms
					of Service and uses the AralSync platform ("Controller,"
					"you," or "your institution"); and
				</li>
				<li>
					<strong>The Processor</strong>{" "}
					<strong>
						ARALSYNC SOFTWARE DEVELOPMENT SERVICES, a business
						registered with the Department of Trade and Industry of
						the Republic of the Philippines under DTI Registration
						No. 8212747
					</strong>
					, developer and operator of the AralSync platform
					("Processor," "AralSync," "we," or "us").
				</li>
			</Ul>
			<P>
				This DPA forms part of, and is incorporated into, the AralSync
				Terms of Service. In the event of a conflict between this DPA
				and the Terms of Service, the terms of this DPA shall prevail
				with respect to data processing matters.
			</P>
			<P>
				This Agreement is required under{" "}
				<strong>
					Republic Act No. 10173 (Data Privacy Act of 2012), Section
					14
				</strong>{" "}
				and its Implementing Rules and Regulations, which require that a
				Personal Information Controller who engages the services of a
				Personal Information Processor execute a written contract
				specifying the scope and purpose of processing and the
				obligations of both parties.
			</P>

			<Sec num="1" title="Parties & Definitions">
				<P>
					For the purposes of this Agreement, the following terms have
					the meanings given:
				</P>
				<Sub title="Applicable Law">
					<P>
						Republic Act No. 10173 (Data Privacy Act of 2012), its
						Implementing Rules and Regulations (IRR), all National
						Privacy Commission (NPC) issuances, circulars, and
						advisory opinions, and any other applicable Philippine
						law relating to data protection and privacy.
					</P>
				</Sub>
				<Sub title="Controller">
					<P>
						The teacher, school, or educational institution that
						determines the purposes and means of processing Personal
						Data in connection with their use of AralSync. The
						Controller is the{" "}
						<strong>Personal Information Controller (PIC)</strong>{" "}
						as defined under RA 10173.
					</P>
				</Sub>
				<Sub title="Data Subject">
					<P>
						Any identified or identifiable natural person whose
						Personal Data is processed through AralSync, including
						but not limited to students, guardians, and teacher
						account holders.
					</P>
				</Sub>
				<Sub title="Personal Data">
					<P>
						Any information from which the identity of an individual
						can be reasonably and directly ascertained, or when put
						together with other information, would directly and
						certainly identify an individual, as defined under{" "}
						<strong>RA 10173 Section 3(g)</strong>. For purposes of
						this Agreement, Personal Data includes all teacher
						account data and student records processed through
						AralSync.
					</P>
				</Sub>
				<Sub title="Personal Data Breach">
					<P>
						A breach of security leading to the accidental or
						unlawful destruction, loss, alteration, unauthorized
						disclosure of, or unauthorized access to, Personal Data
						transmitted, stored, or otherwise processed by AralSync.
					</P>
				</Sub>
				<Sub title="Processing">
					<P>
						Any operation or any set of operations performed upon
						Personal Data including, but not limited to, the
						collection, recording, organization, storage, updating,
						modification, retrieval, consultation, use,
						consolidation, blocking, erasure or destruction of data,
						as defined under <strong>RA 10173 Section 3(j)</strong>.
					</P>
				</Sub>
				<Sub title="Processor">
					<P>
						AralSync (ARALSYNC SOFTWARE DEVELOPMENT SERVICES), which
						processes Personal Data on behalf of the Controller.
						AralSync is the{" "}
						<strong>Personal Information Processor (PIP)</strong> as
						defined under RA 10173.
					</P>
				</Sub>
				<Sub title="Sensitive Personal Information">
					<P>
						Personal information about an individual's race, ethnic
						origin, marital status, age, color, and religious,
						philosophical or political affiliations; health,
						education, genetic or sexual life; court proceedings;
						government-issued identifiers; and any information
						specifically established by an executive order or an act
						of Congress to be kept classified, as defined under{" "}
						<strong>RA 10173 Section 3(l)</strong>.
					</P>
				</Sub>
				<Sub title="Sub-Processor">
					<P>
						Any entity engaged by the Processor to process Personal
						Data on behalf of the Controller.
					</P>
				</Sub>
			</Sec>

			<Sec num="2" title="Scope & Purpose of Processing">
				<Sub title="2.1 Instructions of the Controller">
					<P>
						The Processor shall process Personal Data only in
						accordance with the documented and lawful instructions
						of the Controller. The Controller's instructions are:
					</P>
					<Ul>
						<li>
							To process Personal Data to the extent necessary to
							provide the AralSync Services as described in the
							Terms of Service and Privacy Policy
						</li>
						<li>
							To store Personal Data securely on the Processor's
							cloud infrastructure when the cloud backup feature
							is enabled by the Controller
						</li>
						<li>
							To facilitate the synchronization of Personal Data
							between the Controller's authorized devices as
							directed by the Controller
						</li>
						<li>
							To generate DepEd-prescribed reports (SF2, SF9,
							SF10) from the Personal Data entered by the
							Controller
						</li>
					</Ul>
				</Sub>
				<Sub title="2.2 Specific Processing Activities">
					<LegalTable
						heads={[
							"Processing Activity",
							"Data Involved",
							"Legal Basis",
						]}
						rows={[
							[
								"Account registration and authentication",
								"Teacher name, email, password hash, employee ID",
								"RA 10173 §12(b)   contract performance",
							],
							[
								"Student roster management",
								"Student name, LRN, gender, DOB, guardian details",
								"RA 10173 §12(f)   legitimate interest; DepEd mandate",
							],
							[
								"Attendance recording",
								"Daily attendance status per student per session",
								"RA 10173 §12(e)   public authority mandate",
							],
							[
								"Grade entry and computation",
								"WW/PT/QA scores, quarterly grades",
								"RA 10173 §12(e)   public authority mandate",
							],
							[
								"Report generation (SF2, SF9, SF10)",
								"All relevant student data",
								"RA 10173 §12(e)   public authority mandate",
							],
							[
								"Cloud backup",
								"All teacher and student data (encrypted)",
								"RA 10173 §12(b)   contract performance",
							],
							[
								"LAN device sync",
								"All class data (authenticated, encrypted)",
								"RA 10173 §12(b)   contract performance",
							],
							[
								"Audit logging",
								"User IDs, record IDs, timestamps",
								"RA 10173 §12(f)   legitimate interest (security)",
							],
						]}
					/>
				</Sub>
				<Sub title="2.3 No Processing Beyond Instructions">
					<P>
						The Processor shall not process Personal Data for any
						purpose other than those specified in Section 2.2 above
						or subsequently documented in written instructions from
						the Controller. If the Processor believes an instruction
						infringes Applicable Law, it shall promptly notify the
						Controller.
					</P>
				</Sub>
				<Sub title="2.4 Duration of Processing">
					<P>
						The Processor shall process Personal Data for the
						duration of the agreement between the parties (as set
						out in the Terms of Service) and for the period
						following termination that is necessary to fulfill
						deletion and return obligations under Section 9 of this
						Agreement.
					</P>
				</Sub>
			</Sec>

			<Sec num="3" title="Controller Obligations">
				<P>The Controller represents, warrants, and agrees that:</P>
				<Sub title="3.1 Legal Authority">
					<P>
						The Controller has the legal authority, professional
						mandate, and where required, the appropriate
						institutional authorization to collect and process the
						Personal Data of students in connection with their
						teaching duties under the Department of Education
						framework.
					</P>
				</Sub>
				<Sub title="3.2 Data Quality and Lawfulness">
					<Ul>
						<li>
							The Controller will provide only accurate and
							complete Personal Data
						</li>
						<li>
							The Controller will not instruct the Processor to
							process Personal Data in a manner that violates
							Applicable Law, DepEd regulations, or any applicable
							ethical guidelines
						</li>
						<li>
							The Controller will not enter into AralSync any
							Personal Data that the Controller does not have
							lawful authority to process
						</li>
					</Ul>
				</Sub>
				<Sub title="3.3 Parental Consent">
					<P>The Controller acknowledges that:</P>
					<Ul>
						<li>
							Most Data Subjects (students) are minors, and their
							Personal Data requires heightened protection under
							RA 10173
						</li>
						<li>
							The Controller is responsible for ensuring that
							their school has obtained or documented appropriate
							parental or guardian consent for the collection and
							use of student data in accordance with DepEd orders
							and RA 10173
						</li>
						<li>
							The Controller is responsible for ensuring that
							their school's privacy notices to parents and
							guardians adequately disclose the use of AralSync as
							a data processing tool
						</li>
					</Ul>
				</Sub>
				<Sub title="3.4 Breach Notification to Processor">
					<P>
						The Controller shall notify the Processor{" "}
						<strong>as soon as reasonably practicable</strong> upon
						becoming aware of any Personal Data breach affecting
						data that has been or is being processed by the
						Processor on the Controller's behalf, any unauthorized
						access to the Controller's AralSync account or devices,
						or any circumstances that may give rise to a Personal
						Data breach.
					</P>
				</Sub>
				<Sub title="3.5 Compliance as PIC">
					<P>
						The Controller acknowledges its independent obligations
						as a Personal Information Controller under RA 10173 and
						commits to fulfilling those obligations, including but
						not limited to: registering with the NPC if required;
						maintaining Records of Processing Activities; conducting
						Privacy Impact Assessments for high-risk processing; and
						maintaining a Privacy Management Program in accordance
						with NPC circular requirements.
					</P>
				</Sub>
			</Sec>

			<Sec num="4" title="Processor Obligations">
				<P>
					AralSync, as the Personal Information Processor, agrees to
					the following obligations:
				</P>
				<Sub title="4.1 Process Only on Controller Instructions">
					<P>
						The Processor shall process Personal Data only on the
						documented instructions of the Controller as set out in
						Section 2, except where required to do so by Applicable
						Law, in which case the Processor shall inform the
						Controller of that legal requirement before processing
						(unless prohibited from doing so by law).
					</P>
				</Sub>
				<Sub title="4.2 Confidentiality of Personnel">
					<P>
						The Processor shall ensure that all persons authorized
						to process Personal Data:
					</P>
					<Ul>
						<li>
							Are subject to a{" "}
							<strong>binding confidentiality obligation</strong>{" "}
							(contractual or statutory) with respect to the
							Personal Data
						</li>
						<li>
							Are granted access to Personal Data only on a{" "}
							<strong>need-to-know</strong> basis
						</li>
						<li>
							Are aware of their obligations under this Agreement
							and Applicable Law
						</li>
						<li>Receive appropriate data privacy training</li>
					</Ul>
				</Sub>
				<Sub title="4.3 Security Measures">
					<P>
						The Processor shall implement and maintain the technical
						and organizational security measures specified in
						Section 6 of this Agreement.
					</P>
				</Sub>
				<Sub title="4.4 Sub-Processors">
					<P>
						The Processor shall not engage any Sub-Processor to
						carry out specific processing activities on behalf of
						the Controller without the Controller's prior general or
						specific consent. The Controller's acceptance of this
						DPA constitutes general consent to the use of the
						Sub-Processors listed in Section 5.
					</P>
				</Sub>
				<Sub title="4.5 Assistance with Data Subject Rights">
					<P>
						The Processor shall assist the Controller in responding
						to Data Subject rights requests under RA 10173, to the
						extent reasonably practicable and as described in
						Section 7 of this Agreement.
					</P>
				</Sub>
				<Sub title="4.6 Breach Notification">
					<P>
						The Processor shall notify the Controller of any
						confirmed Personal Data Breach affecting the
						Controller's data within <strong>24 hours</strong> of
						discovery, as described in Section 8.
					</P>
				</Sub>
				<Sub title="4.7 Data Return and Deletion">
					<P>
						Upon termination of this Agreement or upon request of
						the Controller, the Processor shall return or delete
						Personal Data as described in Section 9.
					</P>
				</Sub>
				<Sub title="4.8 Demonstration of Compliance">
					<P>
						The Processor shall make available to the Controller all
						information necessary to demonstrate compliance with
						this Agreement and Applicable Law, and shall cooperate
						with reasonable audit requests as described in Section
						10.
					</P>
				</Sub>
			</Sec>

			<Sec num="5" title="Sub-Processors">
				<Sub title="5.1 Current Approved Sub-Processors">
					<P>
						The Controller provides general consent to the use of
						the following Sub-Processors as of the effective date of
						this Agreement:
					</P>
					<LegalTable
						heads={[
							"Sub-Processor",
							"Role",
							"Data Processed",
							"Location",
						]}
						rows={[
							[
								"Cloud Hosting Provider (TBD)",
								"Server infrastructure for cloud sync and backup",
								"Encrypted data blobs; no plaintext access",
								"Philippines or regional data center",
							],
							[
								"MongoDB Atlas (or equivalent)",
								"Encrypted database storage",
								"Encrypted Personal Data records; no plaintext access",
								"Region configurable; default Asia-Pacific",
							],
						]}
					/>
				</Sub>
				<Sub title="5.2 Changes to Sub-Processors">
					<Ul>
						<li>
							The Processor shall notify the Controller{" "}
							<strong>at least 30 days in advance</strong> of any
							intended addition or replacement of Sub-Processors
						</li>
						<li>
							The Controller has the right to{" "}
							<strong>object</strong> to a new Sub-Processor
							within 14 days of receiving notice, on reasonable
							grounds related to data protection
						</li>
						<li>
							If the Controller objects and the parties cannot
							reach agreement, the Controller may terminate this
							Agreement and the Terms of Service with 30 days
							written notice
						</li>
					</Ul>
				</Sub>
				<Sub title="5.3 Sub-Processor Obligations">
					<P>
						The Processor shall impose on each Sub-Processor, via a
						written contract, data protection obligations{" "}
						<strong>equivalent in substance</strong> to those
						imposed on the Processor under this Agreement, including
						in particular providing sufficient guarantees to
						implement appropriate technical and organizational
						measures for the protection of Personal Data.
					</P>
				</Sub>
			</Sec>

			<Sec num="6" title="Security Measures">
				<P>
					The Processor has implemented and maintains the following
					technical and organizational security measures to ensure a
					level of security appropriate to the risk:
				</P>
				<Sub title="6.1 Encryption">
					<LegalTable
						heads={["Scenario", "Encryption Standard"]}
						rows={[
							[
								"Data at rest (cloud database)",
								"AES-256 encryption",
							],
							[
								"Data in transit (API calls, sync)",
								"TLS 1.2 or higher",
							],
							[
								"LAN sync channel",
								"Authenticated encrypted Socket.IO connection",
							],
							[
								"Password storage",
								"bcrypt hashing (minimum 12 salt rounds)",
							],
							[
								"JWT tokens",
								"HS256/RS256 signature, short-lived (15-minute access tokens)",
							],
						]}
					/>
				</Sub>
				<Sub title="6.2 Authentication and Access Control">
					<Ul>
						<li>
							<strong>Multi-factor security:</strong> JWT access
							tokens + refresh tokens + device ID binding all
							three must be valid for a session to be authorized
						</li>
						<li>
							<strong>Role-based access control (RBAC):</strong>{" "}
							each user role (subject teacher, advisory teacher,
							school admin, super admin) has a defined set of
							permissions; access is restricted to the minimum
							necessary for each role
						</li>
						<li>
							<strong>Least privilege principle:</strong> no user
							has more access than their role requires; advisory
							teachers can access sensitive notes; subject
							teachers cannot
						</li>
						<li>
							<strong>Session timeouts:</strong> access tokens
							expire after 15 minutes; refresh tokens rotate on
							each use and are invalidated after use
						</li>
						<li>
							<strong>Device binding:</strong> refresh tokens are
							tied to the specific device ID registered at login;
							use from an unregistered device triggers
							re-authentication
						</li>
						<li>
							<strong>Brute force protection:</strong> failed
							login attempt limits and temporary lockout after
							repeated failures
						</li>
					</Ul>
				</Sub>
				<Sub title="6.3 Audit Trail">
					<Ul>
						<li>
							All create, read (bulk export), update, and delete
							operations on Personal Data are logged with: user
							ID, record type, record ID, operation type, and
							timestamp
						</li>
						<li>
							Audit logs are <strong>immutable</strong> they
							cannot be edited or deleted by any user through
							normal application functions
						</li>
						<li>
							Audit logs are retained for a minimum of 3 years
						</li>
						<li>
							Personal Data (names, LRNs, grades) does not appear
							in plaintext in audit logs logs reference internal
							record identifiers only
						</li>
					</Ul>
				</Sub>
				<Sub title="6.4 Incident Response">
					<P>
						The Processor maintains a documented{" "}
						<strong>breach response procedure</strong> covering:
						detection, containment, assessment, notification, and
						post-incident review. A designated person is responsible
						for security incident management. Contact for reporting
						incidents: <strong>privacy@aralsync.com</strong>.
					</P>
				</Sub>
				<Sub title="6.5 Backup and Recovery">
					<Ul>
						<li>
							For cloud-enabled accounts, encrypted backups are
							performed on a <strong>daily basis</strong>
						</li>
						<li>
							Backups are stored with geographical redundancy
							(multiple data centers where the cloud hosting
							provider supports it)
						</li>
						<li>
							Backup restoration is tested periodically to verify
							data integrity
						</li>
					</Ul>
				</Sub>
				<Sub title="6.6 Vulnerability Management">
					<Ul>
						<li>
							The Processor conducts regular reviews of
							application dependencies for known vulnerabilities
							and applies security patches promptly
						</li>
						<li>
							Third-party security libraries are updated on a
							regular cadence
						</li>
						<li>
							Security-impacting updates are deployed as urgent
							patches without waiting for scheduled release cycles
						</li>
					</Ul>
				</Sub>
				<Sub title="6.7 Organizational Measures">
					<Ul>
						<li>
							Personnel with access to Personal Data are subject
							to binding confidentiality obligations
						</li>
						<li>
							Access to production data by Processor staff
							requires documented justification and is logged
						</li>
						<li>
							The Processor reviews security measures at least{" "}
							<strong>annually</strong> and upon any significant
							change to processing activities
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="7" title="Data Subject Rights Assistance">
				<Sub title="7.1 Tools Provided to the Controller">
					<P>
						The Processor shall provide the Controller with the
						following in-app tools to assist in responding to Data
						Subject rights requests:
					</P>
					<LegalTable
						heads={["Right", "In-App Tool"]}
						rows={[
							[
								"Right to Access",
								"Settings → Privacy → Export My Data (full JSON/CSV export)",
							],
							[
								"Right to Rectification",
								"Edit student records directly within the class roster",
							],
							[
								"Right to Erasure",
								"Delete individual student records or delete entire class data",
							],
							[
								"Right to Data Portability",
								"Export in JSON, CSV, and Excel formats",
							],
							[
								"Right to Restrict Processing",
								"Archive / lock records (prevents further edits without deletion)",
							],
						]}
					/>
				</Sub>
				<Sub title="7.2 Processor's Role in Rights Requests">
					<Ul>
						<li>
							The Processor will <strong>not</strong> respond
							directly to Data Subject rights requests all such
							requests should be directed to and handled by the
							Controller (the school or teacher), as the Personal
							Information Controller under RA 10173
						</li>
						<li>
							If a Data Subject contacts AralSync directly with a
							rights request, AralSync will inform them that their
							rights request must be directed to their school or
							teacher
						</li>
						<li>
							The Processor will assist the Controller in
							responding to rights requests that require technical
							assistance from the Processor's systems
						</li>
					</Ul>
				</Sub>
				<Sub title="7.3 Response Timeline">
					<P>
						The Processor shall provide technical assistance to the
						Controller for Data Subject rights requests within{" "}
						<strong>10 business days</strong> of receiving the
						Controller's request for assistance, enabling the
						Controller to respond to Data Subjects within the{" "}
						<strong>30-day</strong> period prescribed by RA 10173.
					</P>
				</Sub>
			</Sec>

			<Sec num="8" title="Breach Notification">
				<Sub title="8.1 Processor's Notification Obligation">
					<P>
						In the event of a confirmed Personal Data Breach
						affecting Personal Data processed under this Agreement,
						the Processor shall notify the Controller{" "}
						<strong>within 24 hours</strong> of the Processor's
						discovery of the breach.
					</P>
				</Sub>
				<Sub title="8.2 Content of Breach Notification">
					<P>
						The breach notification to the Controller shall include,
						to the extent available at the time of notification:
					</P>
					<Ul>
						<li>
							The <strong>date and time</strong> of discovery of
							the breach (and occurrence, if known)
						</li>
						<li>
							A <strong>description of the nature</strong> of the
							breach what happened, how it was discovered
						</li>
						<li>
							The{" "}
							<strong>categories and approximate number</strong>{" "}
							of Personal Data records affected
						</li>
						<li>
							The{" "}
							<strong>categories and approximate number</strong>{" "}
							of Data Subjects (individuals) affected
						</li>
						<li>
							The <strong>likely consequences</strong> of the
							breach potential risks to affected individuals
						</li>
						<li>
							The <strong>measures taken or proposed</strong> by
							the Processor to address the breach and mitigate its
							effects
						</li>
						<li>
							The <strong>name and contact details</strong> of the
							Processor's Data Protection Officer or designated
							contact for the breach
						</li>
					</Ul>
					<P>
						Where full information is not yet available at the time
						of initial notification, the Processor shall provide
						information in phases as it becomes available.
					</P>
				</Sub>
				<Sub title="8.3 Controller's Obligations">
					<P>The Controller remains responsible for:</P>
					<Ul>
						<li>
							Notifying the{" "}
							<strong>National Privacy Commission (NPC)</strong>{" "}
							within <strong>72 hours</strong> of becoming aware
							of the breach (if required under RA 10173 and NPC
							Circular No. 16-03)
						</li>
						<li>
							Notifying <strong>affected Data Subjects</strong>{" "}
							(students, parents, guardians) within 72 hours of
							discovery if the breach is likely to result in risks
							to the rights and freedoms of Data Subjects
						</li>
						<li>
							Maintaining a record of all breaches and the actions
							taken
						</li>
					</Ul>
				</Sub>
				<Sub title="8.4 Cooperation">
					<P>
						The Processor shall cooperate fully with the
						Controller's investigation of any Personal Data Breach,
						including providing relevant logs, records, and
						technical information; participating in breach response
						meetings if requested; and implementing additional
						security measures if recommended by the investigation.
					</P>
				</Sub>
			</Sec>

			<Sec num="9" title="Data Return & Deletion">
				<Sub title="9.1 Return and Deletion Upon Termination">
					<P>
						Upon termination of this Agreement or upon a written
						request from the Controller, the Processor shall:
					</P>
					<P>
						<strong>
							Within 30 days of termination or request:
						</strong>
					</P>
					<Ul>
						<li>
							Make available to the Controller a{" "}
							<strong>complete export</strong> of all Personal
							Data processed on the Controller's behalf, in a
							structured, commonly used, and machine-readable
							format (JSON and CSV)
						</li>
						<li>
							This export shall include: teacher account data, all
							student records, all attendance records, all grade
							entries, and all generated report data
						</li>
					</Ul>
					<P>
						<strong>
							Within 30 days after the Controller confirms receipt
							of the export
						</strong>{" "}
						(or at the end of the 30-day export window, whichever is
						earlier):
					</P>
					<Ul>
						<li>
							<strong>Permanently delete</strong> all copies of
							Personal Data from the Processor's cloud
							infrastructure, including primary storage, backups,
							and audit logs (except as required by Applicable Law
							see Section 9.3)
						</li>
						<li>
							Instruct all Sub-Processors to delete their copies
							within the same timeframe
						</li>
					</Ul>
				</Sub>
				<Sub title="9.2 Deletion Certificate">
					<P>
						Upon request from the Controller, the Processor shall
						provide a written <strong>deletion certificate</strong>{" "}
						confirming that all Personal Data has been securely
						deleted from all Processor and Sub-Processor systems,
						including the method of deletion used.
					</P>
				</Sub>
				<Sub title="9.3 Exceptions to Deletion">
					<P>
						The Processor may retain Personal Data beyond the
						deletion deadline only to the extent required by
						Applicable Philippine law or regulatory obligation, a
						valid court order or government directive, or resolution
						of a pending legal dispute between the parties. Any
						retained data shall be protected in accordance with this
						Agreement and shall be deleted as soon as the legal
						obligation permitting retention ceases.
					</P>
				</Sub>
				<Sub title="9.4 Local Device Data">
					<P>
						The Processor acknowledges that local device data
						(stored in the teacher's browser IndexedDB) is outside
						the Processor's direct control. The Controller is
						responsible for clearing local data from their own
						devices. The Processor shall provide clear instructions
						in the app for doing so.
					</P>
				</Sub>
			</Sec>

			<Sec num="10" title="Audit Rights">
				<Sub title="10.1 Written Confirmation of Compliance">
					<P>
						The Controller may request written confirmation from the
						Processor of its compliance with this Agreement{" "}
						<strong>once per calendar year</strong>. The Processor
						shall provide a written compliance summary within{" "}
						<strong>30 business days</strong> of receiving the
						request.
					</P>
				</Sub>
				<Sub title="10.2 Formal Audit Rights">
					<P>
						The Controller (or a third-party auditor appointed by
						the Controller) may conduct an audit of the Processor's
						data processing activities and security measures upon:
					</P>
					<Ul>
						<li>
							Providing{" "}
							<strong>
								at least 30 days advance written notice
							</strong>
						</li>
						<li>
							Limiting the audit scope to matters directly
							relevant to this Agreement and the Processor's
							obligations under Applicable Law
						</li>
						<li>
							Conducting the audit during normal business hours in
							a manner that does not unreasonably disrupt the
							Processor's operations
						</li>
					</Ul>
				</Sub>
				<Sub title="10.3 Audit Costs">
					<P>
						The costs of conducting an audit shall be borne by the{" "}
						<strong>Controller</strong>, except: if the audit
						reveals a material breach of this Agreement by the
						Processor, the Processor shall bear the reasonable costs
						of that audit; and if the audit is conducted by the NPC
						or another regulatory authority, costs are governed by
						the applicable regulatory framework.
					</P>
				</Sub>
				<Sub title="10.4 Certifications as Audit Alternative">
					<P>
						The Processor may, in lieu of or in addition to a direct
						audit, provide the Controller with relevant security
						certifications, third-party audit reports, or
						penetration testing results (with sensitive technical
						details redacted) as evidence of compliance.
					</P>
				</Sub>
			</Sec>

			<Sec num="11" title="Term & Termination">
				<Sub title="11.1 Term">
					<P>
						This Agreement runs{" "}
						<strong>
							concurrently with the AralSync Terms of Service
						</strong>
						. It comes into effect upon the Controller's creation of
						an AralSync account and remains in effect for the
						duration of the Controller's use of the Service.
					</P>
				</Sub>
				<Sub title="11.2 Termination by Controller">
					<P>
						The Controller may terminate this Agreement at any time
						by deleting their AralSync account, subject to the data
						return and deletion provisions of Section 9.
					</P>
				</Sub>
				<Sub title="11.3 Termination by Processor">
					<P>
						The Processor may terminate this Agreement in accordance
						with the termination provisions of the Terms of Service,
						providing the notice periods specified therein.
					</P>
				</Sub>
				<Sub title="11.4 Survival">
					<P>
						The following provisions survive termination of this
						Agreement:
					</P>
					<Ul>
						<li>
							Section 9 (Data Return & Deletion) until all data
							has been returned and deleted
						</li>
						<li>
							Section 8 (Breach Notification) for any breach
							discovered after termination that relates to data
							processed during the term
						</li>
						<li>
							Section 10 (Audit Rights) for a period of 12 months
							following termination
						</li>
						<li>
							Section 12 (Liability Between Parties) for the
							statutory limitation period
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="12" title="Liability Between Parties">
				<Sub title="12.1 Independent Liability">
					<P>
						Each party shall be individually and independently
						liable for damages caused to Data Subjects or third
						parties by their own violation of Applicable Law. The
						fact that one party is a PIC and the other is a PIP does
						not eliminate or transfer individual liability for one
						party's own breaches.
					</P>
				</Sub>
				<Sub title="12.2 Processor's Liability Cap">
					<P>
						The Processor's total aggregate liability to the
						Controller under or in connection with this Agreement
						shall not exceed the cap set out in Section 9 of the
						Terms of Service (the greater of amounts paid in the
						last 12 months or PHP 1,000 for free-tier accounts).
					</P>
				</Sub>
				<Sub title="12.3 Controller Indemnification of Processor">
					<P>
						The Controller shall indemnify, defend, and hold
						harmless the Processor against any claims, losses,
						liabilities, penalties, fines, or costs (including legal
						fees) that arise from:
					</P>
					<Ul>
						<li>
							The Controller's unlawful instructions to the
							Processor
						</li>
						<li>
							The Controller's failure to fulfill its obligations
							as a Personal Information Controller under RA 10173
						</li>
						<li>
							Any claim by a Data Subject arising from the
							Controller's processing decisions or consent
							failures (e.g., failure to obtain parental consent)
						</li>
						<li>
							Any fine or sanction imposed by the NPC on account
							of the Controller's own non-compliance
						</li>
					</Ul>
				</Sub>
				<Sub title="12.4 Processor Indemnification of Controller">
					<P>
						The Processor shall indemnify, defend, and hold harmless
						the Controller against any claims, losses, or
						liabilities that arise directly from:
					</P>
					<Ul>
						<li>
							The Processor's processing of Personal Data outside
							or contrary to the Controller's documented
							instructions
						</li>
						<li>
							The Processor's breach of its security obligations
							under this Agreement causing a Personal Data Breach
						</li>
						<li>
							The Processor's failure to comply with its own
							obligations under RA 10173 as a Personal Information
							Processor
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="13" title="Governing Law">
				<Sub title="13.1 Applicable Law">
					<P>
						This Agreement is governed by and shall be construed in
						accordance with the laws of the{" "}
						<strong>Republic of the Philippines</strong>, including:
						Republic Act No. 10173 (Data Privacy Act of 2012) and
						its IRR; National Privacy Commission issuances and
						circulars; Republic Act No. 8792 (Electronic Commerce
						Act of 2000); and the Civil Code of the Philippines.
					</P>
				</Sub>
				<Sub title="13.2 Regulatory Jurisdiction">
					<P>
						The National Privacy Commission has jurisdiction over
						complaints related to violations of RA 10173. Both
						parties acknowledge the NPC's authority and agree to
						cooperate with any NPC investigation or proceeding.
					</P>
				</Sub>
				<Sub title="13.3 Court Jurisdiction">
					<P>
						For contractual disputes under this Agreement, both
						parties consent to the exclusive jurisdiction of the
						appropriate courts in Tagbilaran City, Bohol,
						Philippines.
					</P>
				</Sub>
			</Sec>

			<Sec num="14" title="Signatures / Acceptance">
				<Sub title="14.1 Individual Teacher Acceptance">
					<P>
						For <strong>individual teacher accounts</strong>, this
						Data Processing Agreement comes into effect upon the
						teacher's:
					</P>
					<Ol>
						<li>
							Checking the "I agree to the Terms of Service,
							Privacy Policy, and Data Processing Agreement"
							checkbox during account registration; and
						</li>
						<li>
							Clicking the "Create Account" or equivalent
							confirmation button.
						</li>
					</Ol>
					<P>
						The acceptance event is recorded with a{" "}
						<strong>timestamp</strong> in the AralSync database,
						constituting a binding electronic acceptance under{" "}
						<strong>
							Republic Act No. 8792 (Electronic Commerce Act)
						</strong>
						.
					</P>
				</Sub>
				<Sub title="14.2 Institutional Acceptance">
					<P>
						For <strong>schools or educational institutions</strong>{" "}
						wishing to enter into this DPA formally as an
						institution, a signed copy of this DPA may be executed:
					</P>
					<Ul>
						<li>
							<strong>Electronically</strong> by an authorized
							school official via email to{" "}
							<strong>privacy@aralsync.com</strong> with a clear
							statement of acceptance on official school
							letterhead; or
						</li>
						<li>
							<strong>Manually (wet signature)</strong> by
							printing, signing, and returning this document to
							ARALSYNC SOFTWARE DEVELOPMENT SERVICES, Tagbilaran
							City, Bohol, Philippines.
						</li>
					</Ul>
					<P>
						A downloadable PDF version of this Agreement is
						available upon request at{" "}
						<strong>privacy@aralsync.com</strong>.
					</P>
				</Sub>
				<Sub title="14.3 Effective Date">
					<P>
						For individual teachers: the effective date of this
						Agreement is the date of account creation.
					</P>
					<P>
						For institutions: the effective date is the date of the
						signed acceptance or the date of first use of the
						Service, whichever is earlier.
					</P>
				</Sub>
				<div className="mt-8 pt-6 border-t border-slate-200 text-[13.5px] text-slate-500 leading-relaxed">
					<strong>ARALSYNC SOFTWARE DEVELOPMENT SERVICES</strong>
					<br />
					DTI Registration No.: 8212747
					<br />
					Tagbilaran City, Bohol, Philippines
					<br />
					Email: privacy@aralsync.com
					<br />
					Website: aralsync.com
				</div>
			</Sec>
		</LegalLayout>
	);
}
