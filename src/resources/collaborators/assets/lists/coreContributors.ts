import getPeopleFromString from '../../getPeopleFromString'

const teamStr = `Nikita Buzov
Founder
@NikitaBuzovEth

Matt Ladin
COO
@MBLADIN

Tim Harrison
Risk Assessment
@npcza

Andrew Leonard
Smart Contracts
@SolaceAndrew

Amir Alnadi
BD
@amiralnadi

Olaf Bieschke
Community Manager
@layersheikh

Danny Fung
Front End
@DannyFungEth

Haraldur Haraldsson
Research and Risk Assessment

Jefferson Tang
Smart Contracts

Selcuk Sozuer
Smart Contracts
@ssozuer

Kevin McDonald
Research and Risk Assessment
@i001962

Sebastian Chacon
Front End

Ivan Andreev
Design
@andreevivan

Nima Cheraghi
Marketing & Content
@0xnimz

Petr Lipatov
Product Marketing`

// line 1: name, line 2: role, line 3: twitter
export default getPeopleFromString(teamStr)
