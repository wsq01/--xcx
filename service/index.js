
const httpUrl = 'https://www.zjcoldcloud.com/xiandun/public/index.php'
export default {
  reqUnbindDev: httpUrl + '/index/Device/remove_bind',
  reqUnbind: httpUrl + '/index/register/unbundle',
  reqDevList: httpUrl + '/index/device/device_list',
  reqLookDev: httpUrl + '/index/index/look_device',
  reqAddMember: httpUrl + '/index/share',
  reqMemberList: httpUrl + '/index/share/membersList',
  reqSendCode: httpUrl + '/index/register/sendCode',
  reqRegister: httpUrl + '/index/register/add',
  reqOpenid: httpUrl,
  reqLogin: httpUrl + '/index/login',
  reqBindDev: httpUrl + '/index/Device/bind_device',
  reqVerifyRegister: httpUrl + '/index/register/verify_user',
  reqBillList: httpUrl + '/index/pay_bill',
  reqEditMember: httpUrl + '/index/share/edit',
  reqDeleteMember: httpUrl + '/index/share/delete',
  reqDevData: 'https://www.zjcoldcloud.com/xiandun/api/01_00_tb_history_data.php',
  reqDevParams: 'https://www.zjcoldcloud.com/xiandun/api/06_00_tb_device_chanshu.php',
  reqSetParams: httpUrl + '/index/device/update_device',
  reqDevCharts: 'https://www.zjcoldcloud.com/xiandun/api/09_00_tb_draw_line.php',
  reqCheckSmsCode: httpUrl + '/index/register/yanzheng_code'
}