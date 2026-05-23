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

export default function Privacy() {
	useEffect(() => {
		document.title = "Privacy Policy   AralSync";
	}, []);

	return (
		<LegalLayout
			title="Privacy Policy"
			subtitle="How AralSync collects, uses, stores, and protects your personal information."
			version="1.0"
			effectiveDate="May 25, 2026"
		>
			<Sec num="1" title="Introduction & Scope">
				<P>
					<strong>AralSync</strong> ("Aral" is the Filipino word for{" "}
					<em>study</em> or <em>learning</em>) is an offline-first
					Progressive Web App (PWA) built for Philippine public school
					teachers. It helps teachers record daily student attendance,
					encode academic grades following the Department of Education
					(DepEd) grading framework, and generate official DepEd forms
					all from any device, even without an internet connection.
				</P>
				<P>
					This Privacy Policy explains how AralSync, developed and
					operated by{" "}
					<strong>
						ARALSYNC SOFTWARE DEVELOPMENT SERVICES, a business
						registered with the Department of Trade and Industry of
						the Republic of the Philippines under DTI Registration
						No. 8212747
					</strong>{" "}
					("we," "us," or "AralSync"), collects, uses, stores, and
					protects personal information in connection with the
					AralSync service.
				</P>
				<Sub title="Who This Policy Applies To">
					<P>This policy applies to:</P>
					<Ul>
						<li>
							<strong>Teachers</strong> who create and use
							AralSync accounts to manage classroom records
						</li>
						<li>
							<strong>School administrators</strong> who access
							AralSync with admin-level privileges
						</li>
						<li>
							Any person whose personal information is processed
							through the AralSync platform, including
							<strong> students</strong> whose records are entered
							by their teachers
						</li>
					</Ul>
				</Sub>
				<Sub title="Our Role Under Philippine Law">
					<P>
						Under <strong>Republic Act No. 10173</strong>, also
						known as the{" "}
						<strong>Data Privacy Act of 2012 (DPA)</strong>, and its
						Implementing Rules and Regulations (IRR), AralSync acts
						as a{" "}
						<strong>Personal Information Processor (PIP)</strong> we
						process personal data on behalf of teachers and schools,
						who act as the{" "}
						<strong>Personal Information Controllers (PICs)</strong>
						.
					</P>
					<P>
						This distinction is explained in detail in Section 2
						below. If you have questions about this policy, please
						contact us at <strong>privacy@aralsync.com</strong>.
					</P>
				</Sub>
			</Sec>

			<Sec num="2" title="Legal Basis for Data Processing">
				<Sub title="Republic Act 10173   Data Privacy Act of 2012">
					<P>
						AralSync processes personal information in accordance
						with <strong>RA 10173 Section 12</strong>, which permits
						processing when at least one of the following criteria
						is met:
					</P>
					<Ul>
						<li>
							<strong>Section 12(a)</strong> The data subject has
							given consent prior to collection and processing.
							Teachers consent when they register on AralSync.
						</li>
						<li>
							<strong>Section 12(b)</strong> Processing is
							necessary for the fulfillment of a contract with the
							data subject. AralSync's Terms of Service constitute
							such a contract.
						</li>
						<li>
							<strong>Section 12(e)</strong> Processing is
							necessary to fulfill functions of public authority,
							which necessarily includes processing for the
							fulfillment of a mandate.
						</li>
						<li>
							<strong>Section 12(f)</strong> Processing is
							necessary for the legitimate interests pursued by
							the personal information controller, except where
							overridden by fundamental rights of the data
							subject.
						</li>
					</Ul>
				</Sub>
				<Sub title="DepEd Mandates">
					<P>
						Recording student attendance and academic grades is a{" "}
						<strong>legal obligation</strong> of every classroom
						teacher under DepEd policy. Specifically:
					</P>
					<Ul>
						<li>
							<strong>DepEd Order No. 8, s. 2015</strong> requires
							teachers to maintain complete and accurate grade
							records using the prescribed K–12 grading system.
						</li>
						<li>
							<strong>DepEd Order No. 3, s. 2018</strong> and
							related issuances require teachers to maintain
							School Form 2 (SF2 Daily Attendance Record) and
							submit it to the school principal monthly.
						</li>
						<li>
							<strong>SF9 (Learner's Report Card)</strong> and{" "}
							<strong>
								SF10 (Learner's Permanent Academic Record)
							</strong>{" "}
							are mandatory documents every teacher must maintain.
						</li>
					</Ul>
					<P>
						AralSync is a digital tool that assists teachers in
						fulfilling these existing legal obligations it does not
						create new obligations.
					</P>
				</Sub>
				<Sub title="Personal Information Controller vs. Processor">
					<P>Under RA 10173:</P>
					<Ul>
						<li>
							A{" "}
							<strong>
								Personal Information Controller (PIC)
							</strong>{" "}
							decides the purpose and means of processing personal
							information. In AralSync,{" "}
							<strong>the teacher or school is the PIC</strong>.
							They decide what student data to enter, how it is
							used, and are directly responsible to students and
							families for proper data handling.
						</li>
						<li>
							A{" "}
							<strong>
								Personal Information Processor (PIP)
							</strong>{" "}
							processes personal information on behalf of the PIC.{" "}
							<strong>AralSync is the PIP.</strong> We provide the
							software platform and infrastructure that enables
							teachers to record and manage data, but we do not
							decide what data is collected or how it is used.
						</li>
					</Ul>
					<P>This means:</P>
					<Ul>
						<li>
							Teachers and schools are primarily responsible for
							obtaining proper consents from students and parents.
						</li>
						<li>
							AralSync is responsible for maintaining a secure and
							compliant technical platform.
						</li>
						<li>
							Both parties have obligations under RA 10173 and
							both must uphold them.
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="3" title="What Data We Collect">
				<Sub title="3.1 Teacher Account Data">
					<LegalTable
						heads={[
							"Data Field",
							"Required / Optional",
							"Why We Collect It",
						]}
						rows={[
							[
								"Full name (last, first, middle)",
								"Required",
								"Account identification and reports",
							],
							[
								"Email address",
								"Required",
								"Account login, notifications, password recovery",
							],
							[
								"Password",
								"Required",
								"Authentication (stored as bcrypt hash   never plain text)",
							],
							[
								"Employee ID / Teacher ID",
								"Required",
								"Verification and school linking",
							],
							[
								"Position / Designation",
								"Required",
								"Role-based access control",
							],
							[
								"School name",
								"Required",
								"Linking teacher to correct school records",
							],
							[
								"School division and district",
								"Required",
								"Organizational structure for reports",
							],
							[
								"Device identifier",
								"Required",
								"Offline sync device pairing and token binding",
							],
							[
								"JWT session tokens",
								"Required",
								"Secure authentication (stored in memory, not cookies)",
							],
							[
								"Profile photo",
								"Optional",
								"Personalization only",
							],
						]}
					/>
				</Sub>
				<Sub title="3.2 Student Data (Entered by Teachers   Not by Students Directly)">
					<LegalTable
						heads={[
							"Data Field",
							"Required / Optional",
							"Why We Collect It",
						]}
						rows={[
							[
								"Full name (last, first, middle initial)",
								"Required",
								"Student identification",
							],
							[
								"LRN (Learner Reference Number   12 digits)",
								"Required",
								"Official DepEd student identifier; required for SF2/SF9/SF10",
							],
							["Gender", "Required", "DepEd form requirements"],
							[
								"Date of birth",
								"Required",
								"SF10 and records verification",
							],
							[
								"Grade level and section assignment",
								"Required",
								"Class roster management",
							],
							[
								"Guardian name, relationship, contact number",
								"Required",
								"Emergency contact; DepEd requirement",
							],
							[
								"Daily attendance records (status per session)",
								"Required",
								"Core function   attendance tracking",
							],
							[
								"Academic grade scores (WW, PT, QA)",
								"Required",
								"Core function   grade encoding",
							],
							[
								"Quarterly computed grades",
								"Required",
								"Generated automatically from scores",
							],
							[
								"Behavioral or health notes",
								"Optional",
								"Teacher-entered; treated as sensitive personal information",
							],
							[
								"Awards and recognition records",
								"Optional",
								"Honor roll and report generation",
							],
						]}
					/>
				</Sub>
				<Sub title="3.3 System Data (Collected Automatically)">
					<LegalTable
						heads={["Data", "Why We Collect It"]}
						rows={[
							[
								"Device type and browser version",
								"PWA compatibility and debugging",
							],
							[
								"Sync timestamps and operation logs",
								"Offline sync queue management and conflict resolution",
							],
							[
								"Error logs",
								"App stability and debugging (no personal data included)",
							],
							[
								"App version in use",
								"Ensuring feature compatibility",
							],
						]}
					/>
				</Sub>
				<Sub title="3.4 What We Do NOT Collect">
					<P>
						AralSync does <strong>not</strong> collect any of the
						following:
					</P>
					<Ul>
						<li>Student photographs or biometric data</li>
						<li>Payment card numbers or financial information</li>
						<li>Social media accounts or profiles</li>
						<li>GPS location or geographic tracking data</li>
						<li>
							Advertising cookies or behavioral tracking
							identifiers
						</li>
						<li>
							Data for advertising, profiling, or marketing
							purposes
						</li>
						<li>
							Any data from students under 18 directly all student
							data is entered by teachers
						</li>
						<li>
							Any data that is sold, traded, or shared with third
							parties for commercial purposes
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="4" title="How We Use Your Data">
				<P>
					AralSync uses collected data exclusively for the following
					purposes:
				</P>
				<Sub title="4.1 Core Service Delivery">
					<Ul>
						<li>
							Enabling teachers to create and manage class
							rosters, sections, and subject assignments
						</li>
						<li>
							Recording and displaying daily student attendance
							(Present, Absent, Late, Excused) per session (AM/PM)
							per subject
						</li>
						<li>
							Encoding and computing student grades using the
							DepEd K–12 component-weighted grading system
							(Written Works, Performance Tasks, Quarterly
							Assessment)
						</li>
						<li>
							Applying the official DepEd transmutation table to
							convert raw percentages to transmuted quarterly
							grades
						</li>
					</Ul>
				</Sub>
				<Sub title="4.2 Official Report Generation">
					<Ul>
						<li>
							Generating <strong>SF2</strong> (Daily Attendance
							Record) in PDF and Excel formats
						</li>
						<li>
							Generating <strong>SF9</strong> (Learner's Report
							Card) per student per quarter
						</li>
						<li>
							Generating <strong>SF10</strong> (Learner's
							Permanent Academic Record) per student
						</li>
						<li>
							Generating class grade summaries and honor roll
							reports
						</li>
					</Ul>
				</Sub>
				<Sub title="4.3 Offline Functionality and Device Sync">
					<Ul>
						<li>
							Storing all records locally on the teacher's device
							using IndexedDB so the app works fully without
							internet
						</li>
						<li>
							Synchronizing records between the teacher's own
							authorized devices over a local area network (LAN),
							using authenticated Socket.IO connections
						</li>
						<li>
							Managing an offline sync queue that pushes local
							changes to cloud backup when internet becomes
							available
						</li>
					</Ul>
				</Sub>
				<Sub title="4.4 Cloud Backup (Optional, Teacher-Controlled)">
					<Ul>
						<li>
							If the teacher enables cloud sync, their records are
							encrypted and stored in our cloud database (MongoDB)
							solely as a backup for their own data
						</li>
						<li>
							Cloud backup can be disabled or all cloud data
							deleted at any time from within app settings
						</li>
					</Ul>
				</Sub>
				<Sub title="4.5 App Improvement">
					<Ul>
						<li>
							<strong>Anonymized and aggregated</strong> system
							logs (error rates, feature usage patterns, sync
							success rates) may be used to improve app
							performance and stability
						</li>
						<li>
							<strong>No personal data</strong> is included in any
							analytics or improvement activities
						</li>
						<li>
							We do not use behavioral tracking, advertising
							analytics, or third-party analytics services that
							process personal data
						</li>
					</Ul>
				</Sub>
				<Sub title="4.6 What We Do NOT Do With Your Data">
					<Ul>
						<li>
							We do <strong>not</strong> sell your data or student
							data to anyone, ever
						</li>
						<li>
							We do <strong>not</strong> use student data for
							advertising or marketing
						</li>
						<li>
							We do <strong>not</strong> profile students or
							teachers for any commercial purpose
						</li>
						<li>
							We do <strong>not</strong> share personal data with
							third parties except as described in Section 7
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="5" title="Data Storage & Security">
				<Sub title="5.1 Local Storage (Primary)">
					<P>
						All attendance records, grade entries, and student data
						are stored{" "}
						<strong>primarily on the teacher's own device</strong>{" "}
						using the browser's <strong>IndexedDB</strong> a local
						database that does not leave the device unless the
						teacher chooses to sync. Local data is protected by the
						teacher's device security (device PIN, biometrics, or
						password). The teacher retains full control over locally
						stored data at all times.
					</P>
				</Sub>
				<Sub title="5.2 Cloud Storage (Optional)">
					<P>
						If the teacher enables cloud backup, data is transmitted
						over <strong>TLS 1.2 or higher</strong>
						(encrypted in transit) and stored in an encrypted{" "}
						<strong>MongoDB</strong> database (
						<strong>AES-256 encryption at rest</strong>). Cloud data
						is accessible only to the authenticated teacher whose
						data it is AralSync staff do not access individual
						teacher records in the normal course of operations.
					</P>
				</Sub>
				<Sub title="5.3 LAN Synchronization">
					<P>
						LAN sync between the teacher's own devices uses an{" "}
						<strong>
							authenticated, encrypted Socket.IO channel
						</strong>{" "}
						devices must be explicitly paired by the teacher before
						sync is permitted. LAN sync does not expose data to the
						general network.
					</P>
				</Sub>
				<Sub title="5.4 Authentication Security">
					<Ul>
						<li>
							<strong>Passwords</strong> are hashed using{" "}
							<strong>bcrypt</strong> plain-text passwords are
							never stored anywhere in our system
						</li>
						<li>
							<strong>JWT access tokens</strong> expire after{" "}
							<strong>15 minutes</strong>
						</li>
						<li>
							<strong>Refresh tokens</strong> are rotated on each
							use and immediately invalidated after use
						</li>
						<li>
							<strong>Device ID binding</strong> tokens are tied
							to the specific registered device, preventing use on
							unauthorized devices
						</li>
						<li>
							Failed login attempt limits are enforced to prevent
							brute-force attacks
						</li>
					</Ul>
				</Sub>
				<Sub title="5.5 Access Controls">
					<Ul>
						<li>
							<strong>Role-based access control (RBAC)</strong>{" "}
							teachers see only their own students and class
							records; school administrators see records within
							their school only
						</li>
						<li>
							Advisory teachers can view sensitive notes (health,
							behavioral) for their advisory section; subject
							teachers cannot
						</li>
						<li>
							AralSync staff have no routine access to personal
							records administrative access requires documented
							justification and is logged
						</li>
					</Ul>
				</Sub>
				<Sub title="5.6 Audit Logging">
					<Ul>
						<li>
							All data creation, modification, and deletion events
							are logged with user ID and timestamp
						</li>
						<li>
							Audit logs are <strong>immutable</strong> they
							cannot be edited or deleted by regular users
						</li>
						<li>
							Logs do not contain student data in plain text they
							reference internal record IDs only
						</li>
					</Ul>
				</Sub>
				<Sub title="5.7 Data in URLs and Error Logs">
					<P>
						Student names, LRNs, and grade data{" "}
						<strong>never appear in URLs</strong> or error log
						messages. Error logs reference internal record IDs only,
						which are meaningless outside the authenticated
						application context.
					</P>
				</Sub>
			</Sec>

			<Sec num="6" title="Data Retention">
				<Sub title="6.1 Active Accounts">
					<P>
						Data for active teacher accounts is retained for the
						duration of the active school year and carries over to
						subsequent school years unless the teacher deletes it.
						Teachers can archive or delete specific school year data
						from within the app at any time.
					</P>
				</Sub>
				<Sub title="6.2 Account Deletion">
					<P>When a teacher deletes their AralSync account:</P>
					<Ul>
						<li>
							All cloud-stored data is{" "}
							<strong>permanently deleted within 30 days</strong>
						</li>
						<li>
							The teacher is given a{" "}
							<strong>30-day grace period</strong> to export data
							before deletion is finalized
						</li>
						<li>
							A confirmation of deletion is provided by email upon
							completion
						</li>
					</Ul>
				</Sub>
				<Sub title="6.3 Local Device Data">
					<P>
						Data stored on the teacher's device (IndexedDB) is{" "}
						<strong>fully under the teacher's control</strong>
						AralSync cannot remotely delete or access local data.
						The teacher can clear local data at any time through the
						browser's storage settings or through AralSync's
						built-in "Clear Local Data" option.
					</P>
				</Sub>
				<Sub title="6.4 Cloud Backup Retention">
					<P>
						Cloud backups are retained for a{" "}
						<strong>maximum of 2 completed school years</strong>{" "}
						unless the teacher requests deletion earlier. At the end
						of the retention period, data is either
						<strong> anonymized</strong> (all identifying fields
						stripped) or <strong>securely deleted</strong>
						using cryptographic erasure.
					</P>
				</Sub>
				<Sub title="6.5 System and Audit Logs">
					<Ul>
						<li>
							Anonymized system logs (no personal data) are
							retained for <strong>12 months</strong>
						</li>
						<li>
							Audit logs (record IDs + timestamps + user IDs) are
							retained for <strong>3 years</strong> for compliance
							and dispute resolution
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="7" title="Data Sharing & Third Parties">
				<Sub title="7.1 We Do Not Sell Your Data">
					<P>
						AralSync does <strong>not</strong> sell, rent, trade, or
						transfer personal information to any third party for
						commercial purposes. This applies to teacher data,
						student data, and all other information processed
						through AralSync.
					</P>
				</Sub>
				<Sub title="7.2 We Do Not Share Data With Advertisers">
					<P>
						AralSync does not use advertising networks, does not
						allow advertisers to target users based on their
						AralSync data, and does not share any user or student
						information with advertising or marketing companies.
					</P>
				</Sub>
				<Sub title="7.3 Limited Third-Party Processors">
					<P>
						AralSync uses the following third-party service
						providers solely for technical infrastructure. They
						process data only to the extent necessary to provide
						those infrastructure services and are bound by
						equivalent data protection obligations:
					</P>
					<LegalTable
						heads={["Sub-Processor", "Purpose", "Data Accessed"]}
						rows={[
							[
								"Cloud Hosting Provider",
								"Server infrastructure for cloud sync and backup",
								"Encrypted data blobs only   no ability to read content",
							],
							[
								"MongoDB Atlas (or equivalent)",
								"Encrypted database storage for cloud backup",
								"Encrypted records only   no access to plaintext data",
							],
						]}
					/>
					<P>
						These providers do not receive data for their own
						purposes and are contractually prohibited from using
						AralSync data for any purpose other than providing their
						infrastructure services.
					</P>
				</Sub>
				<Sub title="7.4 LAN Sync">
					<P>
						LAN sync only transfers data between devices{" "}
						<strong>
							the teacher has explicitly authorized and paired
						</strong>{" "}
						it does not broadcast data to the general network. No
						third party receives data through LAN sync.
					</P>
				</Sub>
				<Sub title="7.5 Legal Requests">
					<P>
						AralSync may be required to disclose information in
						response to <strong>valid legal orders</strong>, court
						orders, or government requests under Philippine law. In
						such cases, AralSync will:
					</P>
					<Ul>
						<li>
							Verify the legal validity of the request before
							complying
						</li>
						<li>
							Disclose only the minimum information required to
							satisfy the legal order
						</li>
						<li>
							Notify affected users of the request as soon as
							legally permitted
						</li>
						<li>Maintain a record of all legal disclosures</li>
					</Ul>
				</Sub>
				<Sub title="7.6 Business Transfers">
					<P>
						In the event of a merger, acquisition, or sale of
						AralSync, users will be notified{" "}
						<strong>30 days in advance</strong> via email and in-app
						notification. Successor entities will be required to
						honor this Privacy Policy or provide users the option to
						delete their data before the transfer is completed.
					</P>
				</Sub>
			</Sec>

			<Sec num="8" title="Rights of Data Subjects">
				<P>
					Under <strong>RA 10173, Section 16</strong>, every person
					whose personal information is processed has the following
					rights. To exercise any of these rights, contact us at{" "}
					<strong>privacy@aralsync.com</strong> or use the in-app data
					request feature (Settings → Privacy → Data Rights). We will
					respond within <strong>30 days</strong> of receiving a
					verified request.
				</P>

				<Sub title="a. Right to Be Informed">
					<P>
						<strong>What it means:</strong> You have the right to
						know what personal information about you is being
						collected, why it is being collected, how it will be
						used, and who it will be shared with before or at the
						time of collection.
					</P>
					<P>
						<strong>How AralSync honors this right:</strong> This
						Privacy Policy is made available before account
						creation. A summary of data collected is presented on
						the registration screen. Material changes to data
						practices are announced 30 days in advance.
					</P>
				</Sub>
				<Sub title="b. Right to Access">
					<P>
						<strong>What it means:</strong> You have the right to
						request a copy of the personal information AralSync
						holds about you, and to know how it has been processed.
					</P>
					<P>
						<strong>How to exercise it:</strong> Log in to AralSync
						→ Settings → Privacy → Request My Data, or email{" "}
						<strong>privacy@aralsync.com</strong> with the subject
						line "Data Access Request." We will provide a complete,
						machine-readable export within <strong>30 days</strong>.
					</P>
				</Sub>
				<Sub title="c. Right to Object">
					<P>
						<strong>What it means:</strong> You have the right to
						object to the processing of your personal information,
						including processing based on legitimate interests.
					</P>
					<P>
						<strong>How to exercise it:</strong> Email{" "}
						<strong>privacy@aralsync.com</strong> with the subject
						line "Objection to Data Processing." We will assess your
						objection and respond within <strong>30 days</strong>.
						Note: objecting to core processing may require account
						deletion.
					</P>
				</Sub>
				<Sub title="d. Right to Erasure or Blocking">
					<P>
						<strong>What it means:</strong> You have the right to
						request deletion or suspension of processing of your
						personal information for example, if the data is no
						longer necessary for the purpose it was collected.
					</P>
					<P>
						<strong>How to exercise it:</strong> For account
						deletion: Log in → Settings → Account → Delete My
						Account. For specific record deletion: email{" "}
						<strong>privacy@aralsync.com</strong>. Cloud data is
						deleted within <strong>30 days</strong> of a verified
						request.
					</P>
				</Sub>
				<Sub title="e. Right to Rectification">
					<P>
						<strong>What it means:</strong> You have the right to
						have inaccurate or incomplete personal information
						corrected.
					</P>
					<P>
						<strong>How to exercise it:</strong> Teacher account
						information can be corrected directly in the app
						(Settings → Profile → Edit). Student data can be
						corrected by teachers directly in the class roster. For
						corrections that cannot be made in-app, email{" "}
						<strong>privacy@aralsync.com</strong>.
					</P>
				</Sub>
				<Sub title="f. Right to Data Portability">
					<P>
						<strong>What it means:</strong> You have the right to
						receive your personal data in a structured, commonly
						used, and machine-readable format, and to transmit it to
						another service.
					</P>
					<P>
						<strong>How to exercise it:</strong> Log in → Settings →
						Privacy → Export My Data. AralSync provides exports in{" "}
						<strong>JSON format</strong> (full data) and{" "}
						<strong>Excel/CSV format</strong> (student records and
						grades). PDF exports of SF2, SF9, and SF10 are available
						from the Reports module. Exports are free of charge at
						any time.
					</P>
				</Sub>
				<Sub title="g. Right to Damages">
					<P>
						<strong>What it means:</strong> You have the right to
						claim compensation if you suffer damages as a result of
						inaccurate, incomplete, outdated, false, unlawfully
						obtained, or unauthorized use of your personal
						information.
					</P>
					<P>
						<strong>How to exercise it:</strong> Contact us at{" "}
						<strong>privacy@aralsync.com</strong> to attempt
						resolution first. If unresolved, you may file a
						complaint with the National Privacy Commission or pursue
						claims through the appropriate courts of the
						Philippines.
					</P>
				</Sub>
				<Sub title="h. Right to File a Complaint with the NPC">
					<P>
						<strong>What it means:</strong> Regardless of any
						resolution attempted with AralSync, you have the
						absolute right to lodge a complaint with the{" "}
						<strong>National Privacy Commission (NPC)</strong> at
						any time.
					</P>
					<P>
						<strong>NPC Contact Information:</strong>
					</P>
					<Ul>
						<li>Website: privacy.gov.ph</li>
						<li>Email: info@privacy.gov.ph</li>
						<li>Complaints: complaints@privacy.gov.ph</li>
						<li>
							Address: 3/F, Core G, GSIS Headquarter Building,
							Roxas Boulevard, Pasay City, Metro Manila,
							Philippines
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="9" title="Student Data   Special Provisions">
				<Sub title="9.1 Students Are Not AralSync Account Holders">
					<P>
						AralSync accounts are created by and for{" "}
						<strong>teachers only</strong>. Students do not create
						accounts, do not log in to AralSync, and do not interact
						with the platform directly. All student data in AralSync
						is entered by the responsible teacher.
					</P>
				</Sub>
				<Sub title="9.2 Students Are Minors   Extra Care Applies">
					<P>
						The overwhelming majority of students in the Philippine
						K–12 system are minors. Under{" "}
						<strong>RA 10173 Section 13</strong> and the IRR, the
						processing of personal information of minors requires
						heightened protection. AralSync applies additional
						safeguards:
					</P>
					<Ul>
						<li>
							Student records are accessible only to the teacher
							assigned to that class load and to authorized school
							administrators not to other teachers
						</li>
						<li>
							Sensitive student data (health notes, behavioral
							notes) is accessible only to the advisory teacher
							and school administrator for that section
						</li>
						<li>
							Student data is never used for any commercial,
							advertising, or analytical purpose
						</li>
						<li>
							Student data is never shared with any third party
							except as required by law
						</li>
					</Ul>
				</Sub>
				<Sub title="9.3 Parental Consent Is the School's Responsibility">
					<P>
						Under the PIC/PIP framework, the{" "}
						<strong>school and teacher (as PIC)</strong> are
						responsible for ensuring that appropriate parental or
						guardian consent has been obtained for the collection
						and use of student data, as required by DepEd policy and
						RA 10173. Schools using AralSync are encouraged to
						include reference to AralSync in their own school
						privacy notices distributed to parents.
					</P>
				</Sub>
				<Sub title="9.4 Sensitive Personal Information">
					<P>
						Under <strong>RA 10173 Section 3(l)</strong>, certain
						categories of information are classified as
						<strong> sensitive personal information</strong> and
						receive heightened protection. The following student
						data entered in AralSync may constitute sensitive
						personal information:
					</P>
					<Ul>
						<li>
							<strong>Health and medical notes</strong> entered by
							teachers (e.g., health conditions affecting
							attendance or performance)
						</li>
						<li>
							<strong>Behavioral notes</strong> that may reflect
							psychological or mental health observations
						</li>
					</Ul>
					<P>
						For these data categories, AralSync applies additional
						restrictions:
					</P>
					<Ul>
						<li>
							Access is limited to the advisory teacher and school
							admin subject teachers without advisory roles cannot
							view these notes
						</li>
						<li>
							These fields are stored separately and are not
							exported in general-purpose data exports unless
							explicitly requested
						</li>
						<li>
							Teachers are advised to enter only the minimum
							information necessary and to follow their school's
							guidelines on documenting sensitive student
							information
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="10" title="Data Breach Response">
				<Sub title="10.1 What Is a Personal Data Breach">
					<P>
						A <strong>personal data breach</strong> is any incident
						that leads to the accidental or unlawful destruction,
						loss, alteration, unauthorized disclosure of, or
						unauthorized access to personal information processed by
						AralSync. This includes unauthorized access to teacher
						or student records, accidental deletion of records with
						no backup, unauthorized disclosure to a third party, or
						a security vulnerability that exposes personal data.
					</P>
				</Sub>
				<Sub title="10.2 Our Internal Response">
					<P>
						Upon discovery or credible report of a potential breach,
						AralSync will:
					</P>
					<Ol>
						<li>
							<strong>Immediately</strong> contain the breach and
							limit further exposure
						</li>
						<li>
							<strong>Within 24 hours</strong> notify affected
							controllers (teachers/schools) of the suspected
							breach and the data that may be affected
						</li>
						<li>
							<strong>Within 48 hours</strong> complete initial
							assessment of the breach scope, affected data
							subjects, and likely consequences
						</li>
						<li>
							<strong>Within 72 hours</strong> if the breach is
							likely to harm 500 or more individuals, file a
							mandatory breach notification with the NPC as
							required by <strong>RA 10173 Section 20(f)</strong>{" "}
							and NPC Circular No. 16-03
						</li>
					</Ol>
				</Sub>
				<Sub title="10.3 Notification to Affected Users">
					<P>
						AralSync will notify affected teachers and schools
						within <strong>72 hours of discovery</strong>
						of a breach that creates significant risk of harm. The
						notification will include: date and time of discovery,
						nature of breach, categories and number of records
						affected, likely consequences, and measures taken or
						proposed.
					</P>
				</Sub>
				<Sub title="10.4 Reporting a Breach to AralSync">
					<P>
						If you suspect or discover a security vulnerability
						affecting AralSync, please report it immediately to{" "}
						<strong>privacy@aralsync.com</strong> with the subject
						line "Security Incident Report." We treat all security
						reports as high priority.
					</P>
				</Sub>
			</Sec>

			<Sec num="11" title="Children's Privacy">
				<P>
					AralSync teacher accounts are for{" "}
					<strong>adults 18 years of age and older only</strong>. We
					do not knowingly allow minors to register as teachers. If we
					discover that a person under 18 years of age has created a
					teacher account, we will suspend the account immediately
					upon discovery, notify the email address on the account, and
					permanently delete all data associated with the account
					within
					<strong> 30 days</strong>.
				</P>
				<P>
					Student data is entered <strong>by teachers</strong>{" "}
					students do not use AralSync directly. AralSync does not
					knowingly collect personal information directly from any
					person under 18 years of age. If you believe a minor has
					registered an account, please contact us immediately at{" "}
					<strong>privacy@aralsync.com</strong>.
				</P>
			</Sec>

			<Sec num="12" title="Cookies & Local Storage">
				<Sub title="12.1 What AralSync Uses Instead of Cookies">
					<P>
						AralSync does <strong>not</strong> use tracking cookies.
						Instead, AralSync uses:
					</P>
					<LegalTable
						heads={[
							"Storage Mechanism",
							"Purpose",
							"Who Controls It",
						]}
						rows={[
							[
								"IndexedDB (browser local database)",
								"Stores all app data locally on the teacher's device   the entire classroom dataset",
								"Teacher / Device owner",
							],
							[
								"In-memory storage",
								"Holds JWT access tokens during an active session   cleared when browser tab is closed",
								"Automatically managed",
							],
							[
								"Secure localStorage (limited use)",
								"Stores encrypted refresh tokens for session continuity across browser sessions   cleared on logout",
								"Cleared on logout or account deletion",
							],
							[
								"Service Worker cache",
								"Caches app assets (HTML, CSS, JavaScript) for offline use   no personal data",
								"Automatically managed by PWA",
							],
						]}
					/>
				</Sub>
				<Sub title="12.2 No Advertising or Tracking">
					<Ul>
						<li>
							AralSync uses{" "}
							<strong>no third-party advertising cookies</strong>
						</li>
						<li>
							AralSync uses{" "}
							<strong>
								no tracking pixels or analytics beacons
							</strong>
						</li>
						<li>
							AralSync does not embed any third-party scripts that
							could track you across other websites (no Google
							Analytics, no Facebook Pixel, no similar services)
						</li>
					</Ul>
				</Sub>
				<Sub title="12.3 What You Can Do">
					<P>
						You can clear all locally stored AralSync data at any
						time through your browser's storage settings. You can
						also use the in-app option: Settings → Privacy → Clear
						Local Data. Clearing local data will remove all
						attendance, grade, and student records from your device
						make sure you have a cloud backup or export before doing
						this.
					</P>
				</Sub>
			</Sec>

			<Sec num="13" title="Changes to This Policy">
				<Sub title="13.1 How We Will Notify You">
					<P>AralSync will notify teachers of changes through:</P>
					<Ul>
						<li>
							<strong>In-app notification</strong> a banner on the
							dashboard informing you of the update
						</li>
						<li>
							<strong>Email notification</strong> to the email
							address on your account
						</li>
					</Ul>
				</Sub>
				<Sub title="13.2 Notice Period">
					<P>
						For <strong>material changes</strong> (changes that
						significantly affect how we collect or use personal
						information, or changes that affect your rights), we
						will provide at least{" "}
						<strong>30 days advance notice</strong> before the
						changes take effect. For minor or technical changes
						(corrections, clarifications), we may update the policy
						immediately but will still provide in-app notification.
					</P>
				</Sub>
				<Sub title="13.3 Acceptance">
					<P>
						Your continued use of AralSync after the effective date
						of a revised Privacy Policy constitutes your acceptance
						of the changes. If you do not agree, you may delete your
						account before the effective date.
					</P>
				</Sub>
				<Sub title="13.4 Version History">
					<P>
						A version history of this Privacy Policy is maintained
						and available upon request at{" "}
						<strong>privacy@aralsync.com</strong>.
					</P>
				</Sub>
			</Sec>

			<Sec num="14" title="Contact & Data Protection Officer">
				<Sub title="Data Protection Officer">
					<P>
						<strong>Data Protection Officer</strong>
					</P>
					<P>ARALSYNC SOFTWARE DEVELOPMENT SERVICES</P>
					<P>DTI Registration No.: 8212747</P>
					<P>Tagbilaran City, Bohol, Philippines</P>
					<P>Email: privacy@aralsync.com</P>
					<P>Website: aralsync.com</P>
					<P>Response time: within 15 business days</P>
				</Sub>
				<Sub title="National Privacy Commission">
					<P>
						If you are not satisfied with our response, or if you
						believe your rights under RA 10173 have been violated,
						you have the right to lodge a complaint directly with
						the <strong>National Privacy Commission (NPC)</strong>:
					</P>
					<Ul>
						<li>Website: privacy.gov.ph</li>
						<li>Complaint email: complaints@privacy.gov.ph</li>
						<li>General inquiries: info@privacy.gov.ph</li>
						<li>
							Address: 3/F, Core G, GSIS Headquarter Building,
							Roxas Boulevard, Pasay City, Metro Manila 1307,
							Philippines
						</li>
					</Ul>
					<P>
						Filing a complaint with the NPC does not waive your
						right to also pursue legal remedies through the courts
						of the Philippines.
					</P>
				</Sub>
			</Sec>
		</LegalLayout>
	);
}
