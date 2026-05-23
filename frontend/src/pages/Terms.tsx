import { useEffect } from "react";
import {
	LegalLayout,
	Sec,
	Sub,
	P,
	Ul,
	Ol,
	Note,
} from "../components/legal/LegalLayout";

export default function Terms() {
	useEffect(() => {
		document.title = "Terms of Service   AralSync";
	}, []);

	return (
		<LegalLayout
			title="Terms of Service"
			subtitle="The agreement between you and AralSync when you use the platform."
			version="1.0"
			effectiveDate="May 25, 2026"
		>
			<P>
				These Terms of Service ("Terms") govern your access to and use
				of AralSync, a Progressive Web App (PWA) for classroom
				attendance and academic records management, developed and
				operated by{" "}
				<strong>
					ARALSYNC SOFTWARE DEVELOPMENT SERVICES, a business
					registered with the Department of Trade and Industry of the
					Republic of the Philippines under DTI Registration No.
					8212747
				</strong>{" "}
				("AralSync," "we," "us," or "our").
			</P>
			<P>
				Please read these Terms carefully before creating an account. By
				registering for or using AralSync, you agree to be bound by
				these Terms and our Privacy Policy and Data Processing
				Agreement, which are incorporated herein by reference. If you
				are using AralSync on behalf of a school or educational
				institution, you represent that you have authority to bind that
				institution to these Terms, and the institution is jointly bound
				by them.
			</P>

			<Sec num="1" title="Acceptance of Terms">
				<Sub title="1.1 Your Agreement">
					<P>
						By creating an AralSync account, accessing the platform,
						or otherwise using the Service, you confirm that:
					</P>
					<Ul>
						<li>
							You have read, understood, and agree to be bound by
							these Terms
						</li>
						<li>
							You are at least <strong>18 years of age</strong>
						</li>
						<li>
							You are a licensed or authorized teacher, school
							administrator, or school official of a Philippine
							public or private school
						</li>
						<li>
							You have the legal authority to enter into this
							agreement personally, and if applicable, on behalf
							of your school or institution
						</li>
					</Ul>
				</Sub>
				<Sub title="1.2 Institutional Acceptance">
					<P>
						If you create or manage an AralSync account on behalf of
						a school, school division, or other educational
						institution: your institution is bound by these Terms;
						you represent that you have proper authorization from
						your institution; and your institution and you are
						jointly and severally responsible for compliance with
						these Terms.
					</P>
				</Sub>
				<Sub title="1.3 Age Requirement">
					<P>
						AralSync is designed exclusively for adult users. You
						must be <strong>18 years of age or older</strong> to
						create and use a teacher account. By accepting these
						Terms, you represent that you meet this requirement.
					</P>
				</Sub>
			</Sec>

			<Sec num="2" title="Description of Service">
				<Sub title="2.1 What AralSync Provides">
					<P>
						AralSync is an{" "}
						<strong>offline-first Progressive Web App</strong> that
						provides Philippine public school teachers with tools
						to:
					</P>
					<Ul>
						<li>
							Create and manage class loads, sections, and subject
							assignments
						</li>
						<li>
							Record daily student attendance (Present, Absent,
							Late, Excused) per session per subject following
							DepEd requirements
						</li>
						<li>
							Encode and compute student grades using the DepEd
							K–12 component-weighted grading system (Written
							Works, Performance Tasks, Quarterly Assessment)
						</li>
						<li>
							Generate official DepEd forms including SF2 (Daily
							Attendance Record), SF9 (Learner's Report Card), and
							SF10 (Learner's Permanent Academic Record)
						</li>
						<li>
							Sync data between the teacher's own authorized
							devices via local area network (LAN)
						</li>
						<li>
							Optionally backup data to a secure cloud database
						</li>
					</Ul>
					<P>
						AralSync works fully <strong>offline</strong> an
						internet connection is not required for core attendance
						and grade entry features.
					</P>
				</Sub>
				<Sub title="2.2 Free Tier and Future Pricing">
					<P>
						AralSync is currently provided{" "}
						<strong>free of charge</strong> during its initial
						release period. We reserve the right to introduce paid
						subscription tiers or premium features in the future.
						Any such changes will be announced with at least{" "}
						<strong>30 days advance notice</strong> via email and
						in-app notification, and will never retroactively charge
						for features you have already been using for free.
					</P>
				</Sub>
				<Sub title="2.3 Beta and Preview Features">
					<P>
						Certain features may be released in{" "}
						<strong>beta or preview</strong> status and labeled as
						such within the app. Beta features are provided for
						evaluation purposes and may be incomplete, subject to
						change, or removed. Beta features are provided without
						warranty.
					</P>
				</Sub>
				<Sub title="2.4 Right to Modify the Service">
					<P>AralSync reserves the right to:</P>
					<Ul>
						<li>Add, modify, or remove features at any time</li>
						<li>
							Temporarily suspend the Service for maintenance
							(with advance notice where possible)
						</li>
						<li>
							Discontinue the Service permanently, with{" "}
							<strong>90 days advance notice</strong> and a
							<strong> 60-day window</strong> for teachers to
							export all their data
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="3" title="Account Registration & Responsibilities">
				<Sub title="3.1 Accurate Information Required">
					<P>
						When registering, you agree to provide{" "}
						<strong>accurate, complete, and current</strong>{" "}
						information including your name, employee ID, school
						affiliation, and contact email. You agree to keep this
						information updated throughout your use of the Service.
					</P>
					<P>
						Providing false information including registering with a
						fake identity, a school you are not affiliated with, or
						another person's credentials is a violation of these
						Terms and may result in immediate account termination.
					</P>
				</Sub>
				<Sub title="3.2 One Account Per Teacher">
					<P>
						Each teacher should maintain{" "}
						<strong>one account</strong> associated with their
						actual identity and school assignment. Creating multiple
						accounts to circumvent limitations, impersonate others,
						or gain unauthorized access is prohibited.
					</P>
				</Sub>
				<Sub title="3.3 Account Security Is Your Responsibility">
					<P>You are responsible for:</P>
					<Ul>
						<li>
							Choosing a <strong>strong, unique password</strong>{" "}
							for your AralSync account
						</li>
						<li>
							Keeping your password and session tokens{" "}
							<strong>confidential</strong> never sharing them
							with colleagues, school staff, or anyone else
						</li>
						<li>
							Securing the devices on which AralSync is installed
							or accessed
						</li>
						<li>
							<strong>Logging out</strong> of AralSync when using
							shared or public devices
						</li>
						<li>
							Ensuring that only authorized devices are paired for
							LAN sync
						</li>
					</Ul>
					<P>
						You are responsible for{" "}
						<strong>
							all activity that occurs under your account
						</strong>
						, whether or not you personally carried it out.
					</P>
				</Sub>
				<Sub title="3.4 Unauthorized Access">
					<P>
						If you discover or suspect unauthorized access to your
						AralSync account, you must:
					</P>
					<Ol>
						<li>Change your password immediately</li>
						<li>
							Review and revoke any unauthorized paired devices in
							Settings → Devices
						</li>
						<li>
							Notify AralSync at{" "}
							<strong>privacy@aralsync.com</strong> with the
							subject line "Unauthorized Access"
						</li>
						<li>
							Report the incident to your school administration if
							student data may have been accessed
						</li>
					</Ol>
				</Sub>
				<Sub title="3.5 Account Suspension">
					<P>
						AralSync may <strong>suspend or restrict</strong> your
						account if we detect a violation of these Terms, unusual
						activity suggesting unauthorized access, prolonged
						inactivity (more than two consecutive school years), or
						failure to pay applicable fees (if paid tiers are
						introduced). We will notify you of a suspension via
						email and provide an opportunity to resolve the issue
						unless the violation requires immediate termination to
						protect other users.
					</P>
				</Sub>
			</Sec>

			<Sec num="4" title="Acceptable Use Policy">
				<Sub title="4.1 Permitted Uses">
					<P>
						As an AralSync teacher user, you <strong>may</strong>:
					</P>
					<Ul>
						<li>
							Record attendance and encode grades for your
							officially assigned classes and class loads
						</li>
						<li>
							Generate and export SF2, SF9, SF10, and other
							reports for submission to school administration
						</li>
						<li>
							Sync data between your own authorized personal and
							work devices
						</li>
						<li>Import student lists via CSV for class setup</li>
						<li>
							Share official DepEd reports with your school
							principal, guidance counselor, or authorized school
							administrator
						</li>
						<li>
							Use AralSync on any device that belongs to you or
							that you are authorized to use for school purposes
						</li>
					</Ul>
				</Sub>
				<Sub title="4.2 Prohibited Uses">
					<P>
						You <strong>may not</strong> use AralSync to:
					</P>
					<Ul>
						<li>
							<strong>Share login credentials</strong> your
							username and password are personal and must not be
							shared with any other person, including colleagues
							or family members
						</li>
						<li>
							<strong>Access another teacher's records</strong>{" "}
							you may only view and edit records for your own
							assigned class loads; attempting to access another
							teacher's data is a serious violation
						</li>
						<li>
							<strong>
								Use student data for unauthorized purposes
							</strong>{" "}
							student attendance and grade data may only be used
							for official school and DepEd reporting purposes
						</li>
						<li>
							<strong>
								Sell, transfer, or commercially exploit student
								data
							</strong>{" "}
							student records are not yours to sell, license,
							trade, or provide to any third party
						</li>
						<li>
							<strong>
								Reverse engineer or copy the application
							</strong>{" "}
							you may not attempt to access the source code of
							AralSync, scrape its data, copy its design, or
							redistribute any part of the application
						</li>
						<li>
							<strong>Upload malicious code</strong> you may not
							use AralSync to upload, transmit, or activate
							malware, viruses, or any code intended to disrupt or
							damage any system
						</li>
						<li>
							<strong>
								Attempt to compromise system security
							</strong>{" "}
							unauthorized security testing, probing, or
							exploitation of AralSync's systems without written
							authorization is strictly prohibited
						</li>
						<li>
							<strong>Use AralSync to harm students</strong> you
							may not use student records to discriminate against,
							harass, defame, or in any way harm a student or
							their family
						</li>
						<li>
							<strong>Create false records</strong> entering
							fabricated attendance or grade data is both a
							violation of these Terms and potentially a violation
							of DepEd regulations
						</li>
						<li>
							<strong>
								Use AralSync for any illegal purpose
							</strong>{" "}
							including violations of RA 10173 (Data Privacy Act),
							RA 6713 (Code of Conduct for Public Officials), and
							any other applicable Philippine law
						</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="5" title="Data Ownership">
				<Sub title="5.1 Your Data Belongs to You">
					<P>
						The attendance records, grade entries, student
						information, and reports you create in AralSync are{" "}
						<strong>your data and your school's data</strong>.
						AralSync claims <strong>no ownership</strong> over any
						student records, grade data, attendance logs, or reports
						you generate.
					</P>
				</Sub>
				<Sub title="5.2 AralSync's Limited License">
					<P>
						By using AralSync, you grant AralSync a{" "}
						<strong>
							limited, non-exclusive, non-transferable license
						</strong>{" "}
						to store, process, and transmit your data solely for the
						purpose of providing the AralSync Service. This license:
					</P>
					<Ul>
						<li>
							Is limited strictly to what is necessary to provide
							the Service
						</li>
						<li>
							Does <strong>not</strong> allow AralSync to use your
							data for advertising, analytics, or any purpose
							beyond service delivery
						</li>
						<li>
							<strong>Terminates automatically</strong> when you
							delete your account or request data deletion
						</li>
						<li>
							Does not grant AralSync ownership or any rights
							beyond service delivery
						</li>
					</Ul>
				</Sub>
				<Sub title="5.3 Data Export Is Always Available">
					<P>
						You may export all your data at any time, free of
						charge, through the app's built-in export function
						(Settings → Privacy → Export My Data). We support export
						in JSON, CSV, Excel, and PDF formats.
					</P>
				</Sub>
				<Sub title="5.4 Student Data Responsibilities">
					<P>
						As the teacher or school (Personal Information
						Controller), you are responsible for the accuracy and
						lawfulness of student data entered into AralSync.
						AralSync is a tool the decisions about what data to
						enter and how it is used remain with you.
					</P>
				</Sub>
			</Sec>

			<Sec num="6" title="Intellectual Property">
				<Sub title="6.1 AralSync Owns the Platform">
					<P>
						The AralSync application, including its design, user
						interface, branding, source code, algorithms, and all
						associated intellectual property, is owned by{" "}
						<strong>
							ARALSYNC SOFTWARE DEVELOPMENT SERVICES, a business
							registered with the Department of Trade and Industry
							of the Republic of the Philippines under DTI
							Registration No. 8212747
						</strong>
						, protected under Philippine intellectual property laws
						including <strong>Republic Act No. 8293</strong>{" "}
						(Intellectual Property Code of the Philippines).
					</P>
				</Sub>
				<Sub title="6.2 What You May Do">
					<Ul>
						<li>
							Use AralSync as described in Section 4.1 (Permitted
							Uses) for your own professional teaching purposes
						</li>
						<li>
							Share official DepEd report outputs (SF2, SF9, SF10)
							as required by your professional duties
						</li>
					</Ul>
				</Sub>
				<Sub title="6.3 What You May Not Do">
					<Ul>
						<li>
							Copy, reproduce, distribute, or resell any part of
							the AralSync application
						</li>
						<li>
							Use AralSync's branding, name, or logo without
							written permission
						</li>
						<li>
							Create derivative works based on AralSync's design
							or functionality
						</li>
						<li>
							Use AralSync's data structures, reports, or APIs to
							build competing products without written
							authorization
						</li>
					</Ul>
				</Sub>
				<Sub title="6.4 Government Forms">
					<P>
						SF2, SF9, SF10 and other DepEd forms referenced in
						AralSync are public government documents. AralSync
						generates these forms in compliance with DepEd
						prescribed formats we make no claim of ownership over
						these government form templates.
					</P>
				</Sub>
			</Sec>

			<Sec num="7" title="Fees & Payment">
				<Sub title="7.1 Current Free Tier">
					<P>
						AralSync is currently available{" "}
						<strong>free of charge</strong> for all teachers. No
						credit card or payment information is required during
						the current free period.
					</P>
				</Sub>
				<Sub title="7.2 Future Paid Plans">
					<P>
						AralSync reserves the right to introduce{" "}
						<strong>paid subscription plans</strong> or premium
						features. If and when paid plans are introduced:
					</P>
					<Ul>
						<li>
							You will receive{" "}
							<strong>30 days advance notice</strong> via email
							and in-app notification before any charges are
							introduced
						</li>
						<li>
							You will never be automatically enrolled in a paid
							plan without your explicit consent
						</li>
						<li>
							Free tier features will continue to be clearly
							defined and differentiated from paid features
						</li>
					</Ul>
				</Sub>
				<Sub title="7.3 Price Changes">
					<P>
						If paid plans are introduced and prices subsequently
						change, users on paid plans will receive
						<strong> 30 days advance notice</strong> before the
						price change takes effect.
					</P>
				</Sub>
				<Sub title="7.4 No Refund Policy (Future Paid Plans)">
					<P>
						For any annual or multi-month paid subscriptions (if
						introduced), fees paid are{" "}
						<strong>non-refundable</strong> except where required by
						applicable Philippine consumer protection law. Monthly
						subscriptions (if introduced) may be cancelled at any
						time and will not renew after the current billing period
						ends.
					</P>
				</Sub>
			</Sec>

			<Sec num="8" title="Disclaimer of Warranties">
				<Note>
					<strong>Please read this section carefully.</strong> It
					limits AralSync's responsibilities in ways that are
					important for you to understand.
				</Note>
				<Sub title='8.1 "As Is" and "As Available"'>
					<P>
						AralSync is provided <strong>"as is"</strong> and{" "}
						<strong>"as available"</strong> without warranty of any
						kind, express or implied. To the maximum extent
						permitted by applicable Philippine law, AralSync
						expressly disclaims all warranties, including but not
						limited to:
					</P>
					<Ul>
						<li>
							Warranties of <strong>merchantability</strong> that
							the Service is fit for a general purpose
						</li>
						<li>
							Warranties of{" "}
							<strong>fitness for a particular purpose</strong>{" "}
							that the Service will meet your specific needs
						</li>
						<li>
							Warranties of <strong>non-infringement</strong> that
							the Service does not infringe any third-party rights
						</li>
						<li>
							Warranties of{" "}
							<strong>accuracy or completeness</strong> of any
							data or reports generated
						</li>
					</Ul>
				</Sub>
				<Sub title="8.2 No Uptime Guarantee">
					<P>
						AralSync does not guarantee 100% uptime for cloud or
						sync features. However, because AralSync is{" "}
						<strong>offline-first</strong>, core attendance and
						grade entry functions remain fully available even when
						the internet or cloud services are unavailable. Internet
						connectivity is not required for core features.
					</P>
				</Sub>
				<Sub title="8.3 No Guarantee Against Data Loss">
					<P>
						While AralSync implements robust data storage and backup
						features, we do <strong>not guarantee</strong> that data
						will never be lost. Data loss can occur due to device
						failure, browser storage limits, user error, or
						unforeseen technical failures. We strongly recommend:
					</P>
					<Ul>
						<li>Enabling cloud backup in AralSync settings</li>
						<li>
							Regularly exporting data backups (Settings → Privacy
							→ Export My Data)
						</li>
						<li>
							Maintaining paper backup records as required by
							DepEd regulations
						</li>
					</Ul>
				</Sub>
				<Sub title="8.4 Teacher Remains Responsible for Records">
					<P>
						AralSync is a digital tool using AralSync does not
						transfer your professional responsibility for the
						accuracy of student records to AralSync. Any records
						submitted to DepEd, the school principal, or other
						authorities remain your professional responsibility.
						AralSync facilitates record-keeping but does not verify
						the accuracy of data you enter.
					</P>
				</Sub>
				<Sub title="8.5 DepEd Form Format Changes">
					<P>
						AralSync generates SF2, SF9, and SF10 according to the
						DepEd form formats in effect at the time of the app's
						last update. If DepEd changes the required format after
						the app's last update, AralSync does not guarantee that
						generated forms will remain fully compliant until the
						app is updated. We commit to updating form templates
						promptly following any official DepEd format changes.
					</P>
				</Sub>
			</Sec>

			<Sec num="9" title="Limitation of Liability">
				<Note>
					<strong>
						This section further limits AralSync's legal liability.
					</strong>{" "}
					Please read it carefully.
				</Note>
				<Sub title="9.1 No Indirect Damages">
					<P>
						To the maximum extent permitted by applicable Philippine
						law, AralSync and its developer, officers, and
						affiliates shall not be liable for any indirect,
						incidental, consequential, or special damages, including
						but not limited to: loss of profits or revenue, loss of
						data, loss of goodwill, or cost of substitute products.
					</P>
				</Sub>
				<Sub title="9.2 Maximum Liability Cap">
					<P>
						To the maximum extent permitted by Philippine law,
						AralSync's total cumulative liability to you for any
						claim arising out of or related to these Terms or the
						Service shall not exceed:
					</P>
					<Ul>
						<li>
							The{" "}
							<strong>
								total amount you paid to AralSync in the 12
								months preceding the claim
							</strong>
							; or
						</li>
						<li>
							<strong>Philippine Peso 1,000 (PHP 1,000)</strong>{" "}
							if you are on the free tier
						</li>
					</Ul>
				</Sub>
				<Sub title="9.3 Specific Exclusions from Liability">
					<P>
						AralSync is <strong>not liable</strong> for:
					</P>
					<Ul>
						<li>
							Data loss or corruption caused by device failure,
							hardware malfunction, or browser storage limits
						</li>
						<li>
							Data loss caused by the teacher clearing local
							storage or deleting their account
						</li>
						<li>
							DepEd disciplinary actions, sanctions, or
							investigations arising from errors in the teacher's
							own record-keeping
						</li>
						<li>
							Consequences arising from the teacher's failure to
							export and backup their data
						</li>
						<li>
							Third-party service outages (internet provider,
							cloud hosting provider, MongoDB Atlas) that affect
							sync functionality
						</li>
						<li>
							Acts of God, natural disasters, power outages, or
							other force majeure events
						</li>
						<li>
							Any harm resulting from unauthorized access to the
							teacher's account where the teacher failed to take
							reasonable security precautions
						</li>
					</Ul>
				</Sub>
				<Sub title="9.4 Philippine Law Limits">
					<P>
						Nothing in this section limits AralSync's liability to
						the extent such limitation is not permitted under
						Republic Act No. 7394 (Consumer Act of the Philippines)
						or any other applicable mandatory Philippine law.
					</P>
				</Sub>
			</Sec>

			<Sec num="10" title="Indemnification">
				<P>
					You agree to{" "}
					<strong>indemnify, defend, and hold harmless</strong>{" "}
					AralSync, its developer, officers, employees, and affiliates
					from and against any claims, liabilities, damages, losses,
					costs, and expenses (including reasonable legal fees)
					arising from:
				</P>
				<Ul>
					<li>
						Your <strong>violation of these Terms</strong> any
						breach of the obligations, restrictions, or conditions
						set out herein
					</li>
					<li>
						Your <strong>misuse of student data</strong> using
						student records for unauthorized purposes, sharing them
						with unauthorized parties, or any processing beyond
						official school duties
					</li>
					<li>
						Your <strong>violation of RA 10173</strong> any failure
						on your part as a Personal Information Controller to
						comply with your obligations under the Data Privacy Act
					</li>
					<li>
						<strong>False or inaccurate information</strong> you
						provided during account registration or in connection
						with the Service
					</li>
					<li>
						Any <strong>third-party claims</strong> arising from
						your conduct on the AralSync platform
					</li>
				</Ul>
				<P>
					This indemnification obligation survives termination of your
					account and these Terms.
				</P>
			</Sec>

			<Sec num="11" title="Termination">
				<Sub title="11.1 Your Right to Delete Your Account">
					<P>
						You may delete your AralSync account at any time through
						the in-app option (Settings → Account → Delete My
						Account). Upon initiating deletion, your account is
						immediately deactivated. You have a{" "}
						<strong>30-day grace period</strong> to export your data
						before permanent deletion is finalized. After 30 days,
						all cloud data is permanently deleted per the Privacy
						Policy.
					</P>
				</Sub>
				<Sub title="11.2 AralSync's Right to Terminate">
					<P>
						AralSync may suspend or permanently terminate your
						account in the following circumstances:
					</P>
					<Ul>
						<li>
							<strong>Terms violation</strong> breach of any
							provision of these Terms, particularly Sections 4
							(Acceptable Use) and 5 (Data Ownership)
						</li>
						<li>
							<strong>Prolonged inactivity</strong> no account
							activity for more than two consecutive school years
							(you will receive a{" "}
							<strong>60-day advance notice</strong> before
							termination for inactivity)
						</li>
						<li>
							<strong>Non-payment</strong> if paid tiers are
							introduced and you fail to pay after a grace period
						</li>
						<li>
							<strong>Legal requirement</strong> if termination is
							required by a valid court order or legal obligation
						</li>
					</Ul>
				</Sub>
				<Sub title="11.3 Data Upon Termination">
					<P>
						When your account is terminated (whether by you or by
						AralSync), you have a <strong>30-day window</strong> to
						export all your data in machine-readable format. After
						this window, all cloud data is permanently deleted.
						Local data on your device remains under your control and
						must be cleared by you directly.
					</P>
				</Sub>
				<Sub title="11.4 Survival">
					<P>
						The following sections survive termination of these
						Terms and your account:
					</P>
					<Ul>
						<li>
							Section 5 (Data Ownership) with respect to
							AralSync's cessation of license
						</li>
						<li>Section 6 (Intellectual Property)</li>
						<li>Section 8 (Disclaimer of Warranties)</li>
						<li>Section 9 (Limitation of Liability)</li>
						<li>Section 10 (Indemnification)</li>
						<li>Section 12 (Governing Law & Disputes)</li>
					</Ul>
				</Sub>
			</Sec>

			<Sec num="12" title="Governing Law & Disputes">
				<Sub title="12.1 Governing Law">
					<P>
						These Terms and your use of AralSync are governed
						exclusively by the laws of the{" "}
						<strong>Republic of the Philippines</strong>, including
						but not limited to: Republic Act No. 10173 (Data Privacy
						Act of 2012), Republic Act No. 8792 (Electronic Commerce
						Act of 2000), Republic Act No. 8293 (Intellectual
						Property Code), Republic Act No. 7394 (Consumer Act of
						the Philippines), and the Civil Code of the Philippines.
					</P>
				</Sub>
				<Sub title="12.2 Good-Faith Resolution First">
					<P>
						Before pursuing formal legal remedies, both parties
						agree to attempt resolution of any dispute through{" "}
						<strong>good-faith negotiation</strong>. To initiate
						this process, contact us at{" "}
						<strong>privacy@aralsync.com</strong> with the subject
						line "Dispute Resolution Request." We commit to
						responding within <strong>10 business days</strong> and
						engaging in good-faith discussions for up to{" "}
						<strong>30 days</strong>.
					</P>
				</Sub>
				<Sub title="12.3 Formal Dispute Resolution">
					<P>
						If good-faith negotiation fails to resolve the dispute
						within 30 days, either party may pursue legal remedies
						through the appropriate courts of Tagbilaran City,
						Bohol. Both parties consent to the exclusive
						jurisdiction of these courts for any disputes arising
						under or related to these Terms.
					</P>
				</Sub>
				<Sub title="12.4 NPC Complaints">
					<P>
						Nothing in these Terms prevents you from filing a
						complaint with the{" "}
						<strong>National Privacy Commission (NPC)</strong>{" "}
						regarding privacy-related matters. Your right to access
						the NPC is absolute under RA 10173.
					</P>
				</Sub>
			</Sec>

			<Sec num="13" title="Changes to Terms">
				<Sub title="13.1 Material Changes">
					<P>
						For <strong>material changes</strong> to these Terms
						those that significantly affect your rights,
						obligations, or how the Service works AralSync will
						provide at least <strong>30 days advance notice</strong>{" "}
						via email and in-app notification, clearly describe what
						is changing and why, and allow you to delete your
						account and export your data before the changes apply if
						you do not wish to accept them.
					</P>
				</Sub>
				<Sub title="13.2 Acceptance of Changes">
					<P>
						Continued use of AralSync after the effective date of a
						material change constitutes your acceptance of the
						revised Terms. If you do not agree with a material
						change, you must stop using AralSync and delete your
						account before the effective date.
					</P>
				</Sub>
				<Sub title="13.3 Minor Changes">
					<P>
						For non-material changes (typographical corrections,
						clarifications, legal citation updates), we may update
						the Terms immediately. We will still post an in-app
						notice of the update and clearly mark the "Last Updated"
						date.
					</P>
				</Sub>
				<Sub title="13.4 Version History">
					<P>
						A version history of these Terms is maintained and
						available upon request at{" "}
						<strong>privacy@aralsync.com</strong>.
					</P>
				</Sub>
			</Sec>

			<Sec num="14" title="Contact">
				<P>
					For questions, concerns, or feedback about these Terms of
					Service:
				</P>
				<Ul>
					<li>
						<strong>ARALSYNC SOFTWARE DEVELOPMENT SERVICES</strong>
					</li>
					<li>
						<strong>DTI Registration No.:</strong> 8212747
					</li>
					<li>
						<strong>Address:</strong> Tagbilaran City, Bohol,
						Philippines
					</li>
					<li>
						<strong>Email:</strong> privacy@aralsync.com
					</li>
					<li>
						<strong>Website:</strong> aralsync.com
					</li>
					<li>
						<strong>Response Time:</strong> Within{" "}
						<strong>5 business days</strong> for general inquiries
					</li>
				</Ul>
				<P>
					For privacy-related concerns, refer to Section 14 of our
					Privacy Policy for the Data Protection Officer contact
					information.
				</P>
				<P>
					For urgent security incidents, email{" "}
					<strong>privacy@aralsync.com</strong> with the subject line
					"Security Incident" we treat these with highest priority.
				</P>
			</Sec>
		</LegalLayout>
	);
}
