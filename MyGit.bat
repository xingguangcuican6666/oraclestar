@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: Git ���ܹ����� v2.1
:: ����: LaT-SKY
:: �޸�����: 2025-08-04
:: v0.2 ����: ���ǲ�д�˰�
:: ============================================================================


:: --- ����� ---
call :main_menu
exit /b


:: ============================================================================
:: ���˵�
:: ============================================================================
:main_menu
cls
echo *******************************************************
echo.
echo                  Git ���ܹ�������
echo.
echo *******************************************************
echo  [��������]
echo.
echo    1. ���̲�ͬ���Ķ�
echo    2. ��ȡ�Ŷ����´���
echo    3. ��ʼһ��������
echo.
echo  [��������]
echo.
echo    4. �鿴�ҵĹ�������
echo    5. ʵ�ù���...
echo    6. �߼��趨...
echo    7. �˳�
echo.
echo *******************************************************

set /p "choice=��ѡ����� (1-7): "

if "!choice!"=="1" call :save_and_sync
if "!choice!"=="2" call :get_latest_code
if "!choice!"=="3" call :initiate_pr
if "!choice!"=="3" call :start_new_task
if "!choice!"=="4" call :check_progress
if "!choice!"=="5" call :utility_menu
if "!choice!"=="6" call :advanced_menu
if "!choice!"=="7" exit /b

:: ���������Ч������ʾ��������ʾ�˵�
echo.
echo   �밴������������˵�...
pause >nul
goto main_menu


:: ============================================================================
:: ���Ĺ���ģ��
:: ============================================================================

:: --- 1. ���̲�ͬ���Ķ� ---
:save_and_sync
cls
call :check_git_repo || goto :eof
echo ******** ���̲�ͬ���Ķ� ********
echo.
echo �˹��ܻ���������ص����иĶ������̡�(commit) ����ͬ����(push) ��Զ�ֿ̲⡣
echo.

:: ��ȡ��ǰ��֧��
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set "current_branch=%%i"
echo ��ǰ��֧: !current_branch!
echo.

:: ����Ƿ��б��
call :check_for_changes
if !has_changes! == 0 (
    echo û�м�⵽�µ��ļ������
    set /p "force_push=�Ƿ���Ҫ�������ͱ������е��ύ? (Y/N): "
    if /i "!force_push!" neq "Y" goto :eof
    goto :push_changes
)

:: ��Ӳ��ύ
set /p "commit_msg=�����뱾�θĶ��ļ������: "
if not defined commit_msg (
    echo. & echo [����] ������Ϣ����Ϊ�գ� & pause & goto :eof
)
echo.
echo ����������б��...
git add .
echo �����ύ...
git commit -m "!commit_msg!"
if !errorlevel! neq 0 (
    echo. & echo [����] �ύʧ�ܣ������������Ϣ�� & pause & goto :eof
)

:push_changes
echo.
echo ���ڽ��Ķ����͵�Զ�ֿ̲� (!current_branch! ��֧)...
git push origin !current_branch!
if !errorlevel! neq 0 (
    echo.
    echo [��ʾ] ����ʧ�ܡ����������Ϊ���Ǹ��·�֧��
    set /p "setup_upstream=�Ƿ�Ҫ�����ط�֧��Զ�̹���������? (Y/N): "
    if /i "!setup_upstream!"=="Y" (
        git push --set-upstream origin !current_branch!
    )
)

echo.
echo ������ɣ�
pause
goto :main_menu


:: --- 2. ��ȡ�Ŷ����´��� ---
:get_latest_code
cls
call :check_git_repo || goto :eof
echo ******** ��ȡ�Ŷ����´��� ********
echo.
echo �˹��ܽ���Զ������֧ (main/master) ��ȡ���µĴ��룬
echo �����������ĵ�ǰ��֧�ϲ����������ִ������¡�
echo.
set /p "confirm=ȷ��Ҫ��ȡ���´�����? (Y/N): "
if /i "!confirm!" neq "Y" goto :eof

echo.
echo �����л�������֧ (main) ����ȡ����...
git checkout main
git pull origin main
if !errorlevel! neq 0 (
    echo [��ʾ] �л�����ȡ main ��֧ʧ�ܣ����� master ��֧...
    git checkout master
    git pull origin master
    if !errorlevel! neq 0 (
        echo [����] �޷��� main �� master ��֧��ȡ���¡����ֶ���顣
        pause & goto :eof
    )
)

echo.
echo �����ѳɹ���ȡ��
pause
goto :main_menu

:: --- 3. ��ʼһ�������� ---
:start_new_task
cls
call :check_git_repo || goto :eof
echo ******** ��ʼһ�������� ********
echo.
echo һ���õ�ϰ����Ϊÿ���¹��ܻ��޸�����һ�������ķ�֧��
echo.
echo --- ���з�֧�б� ---
git branch -a
echo ------------------------
echo.
set /p "branch_name=������������ķ�֧�� (���������з�֧�������л�): "
if not defined branch_name (
    echo. & echo [����] ��֧������Ϊ�գ� & pause & goto :eof
)

:: ����֧�Ƿ��Ѵ���
git rev-parse --verify !branch_name! >nul 2>&1
if !errorlevel! == 0 (
    echo.
    echo ��֧ "!branch_name!" �Ѵ��ڣ�����Ϊ���л�...
    git checkout !branch_name!
) else (
    echo.
    echo ����Ϊ���������л����·�֧ "!branch_name!"...
    git checkout -b !branch_name!
)

if !errorlevel! neq 0 (
    echo. & echo [����] ����ʧ�ܣ����������Git״̬��
) else (
    echo. & echo �����ɹ���������λ�� "!branch_name!" ��֧��
)
pause
goto :main_menu


:: --- 5. �鿴�ҵĹ������� ---
:check_progress
cls
call :check_git_repo || goto :eof
echo ******** �鿴�ҵĹ������� ********
echo.
echo --- 1. �ļ�״̬---
git status
echo.
echo --------------------------------------------------
echo.
echo --- 2. ����ύ��ʷ ---
git log --oneline -10 --graph --decorate
echo.
echo --------------------------------------------------
pause
goto :main_menu


:: ============================================================================
:: ʵ�ù��߲˵�
:: ============================================================================
:utility_menu
cls
echo ****************************************
echo.
echo                 ʵ�ù���
echo.
echo ****************************************
echo  1. ������һ���ύ
echo  2. �ݴ湤������
echo  3. �������Ѻϲ���֧
echo  4. ���� .gitignore �ļ�
echo  5. �������˵�
echo ****************************************

set /p "util_choice=��ѡ�� (1-5): "
if "!util_choice!"=="1" call :undo_last_commit
if "!util_choice!"=="2" call :stash_menu
if "!util_choice!"=="3" call :clean_local_branches
if "!util_choice!"=="4" call :generate_gitignore_menu
if "!util_choice!"=="5" goto main_menu

goto utility_menu

:: --- ʵ�ù�����ģ�� ---

:undo_last_commit
call :check_git_repo || goto :eof
echo.
echo --- ������һ���ύ ---
echo �˲����Ὣ���һ�ε��ύ�����������������ļ��Ķ��ڹ�������
echo.
set /p "confirm=��ȷ��Ҫ��������? (Y/N): "
if /i not "!confirm!"=="Y" goto :eof

echo ����ִ�� git reset --soft HEAD~1 ...
git reset --soft HEAD~1
echo.
echo ������ɣ���һ���ύ�ѱ�����������ļ��Ķ��ѷŻ��ݴ�����
echo �������޸ĺ������ύ��
pause
goto :main_menu

:stash_menu
cls
echo ******** �ݴ湤������********
echo.
git stash list
echo ------------------------------------
echo 1. �ݴ浱ǰ���иĶ�
echo 2. �ָ����һ���ݴ�
echo 3. ����
echo ************************************
set /p "stash_choice=��ѡ�� (1-3): "
if "!stash_choice!"=="1" (
    echo �����ݴ�... & git stash & echo ������ɣ�
    pause
)
if "!stash_choice!"=="2" (
    echo ���ڻָ�... & git stash pop & echo ������ɣ�
    pause
)
if "!stash_choice!"=="3" goto :eof
goto stash_menu

:clean_local_branches
call :check_git_repo || goto :eof
echo.
echo --- �������Ѻϲ���֧ ---
echo �˹��ܻ�����Ѿ��ϲ��� main/master ��֧�ı��ط�֧��������ѡ��ɾ����
echo.
echo ���ڲ��ҿ�����ķ�֧...
:: ʹ�� findstr ��� grep
for /f "tokens=*" %%b in ('git branch --merged main ^| findstr /v /c:"* main"') do (
    set /p "del_confirm=�Ƿ�ɾ���Ѻϲ��ı��ط�֧ "%%b"? (Y/N): "
    if /i "!del_confirm!"=="Y" (
        git branch -d %%b
    )
)
for /f "tokens=*" %%b in ('git branch --merged master ^| findstr /v /c:"* master"') do (
    set /p "del_confirm=�Ƿ�ɾ���Ѻϲ��ı��ط�֧ "%%b"? (Y/N): "
    if /i "!del_confirm!"=="Y" (
        git branch -d %%b
    )
)
echo.
echo ������ɣ�
pause
goto :main_menu

:generate_gitignore_menu
cls
echo ******** ���� .gitignore �ļ� ********
echo 1. ͨ������
echo 2. C++ (Visual Studio)
echo 3. Python
echo 4. Node.js
echo 5. ����
echo ************************************
set /p "gitchoice=��ѡ����Ŀ����: "
set "gittemplate="
if "!gitchoice!"=="1" set "gittemplate=General"
if "!gitchoice!"=="2" set "gittemplate=C++"
if "!gitchoice!"=="3" set "gittemplate=Python"
if "!gitchoice!"=="4" set "gittemplate=NodeJS"
if "!gitchoice!"=="5" goto :eof

if defined gittemplate (
    call :write_gitignore !gittemplate!
    echo .gitignore �ļ��Ѹ��� !gittemplate! ģ������/���ǣ�
) else (
    echo ��Ч���룡
)
pause
goto :main_menu


:: ============================================================================
:: �߼��趨�˵�
:: ============================================================================
:advanced_menu
cls
echo ****************************************
echo.
echo                 �߼��趨
echo.
echo ****************************************
echo  1. ������ǩ
echo  2. �ϲ���֧
echo  3. ɾ����֧
echo  4. Զ�ֿ̲����
echo  5. ���زֿ��ʼ��
echo  6. �����û���Ϣ
echo  7. �������˵�
echo ****************************************

set /p "adv_choice=��ѡ�� (1-7): "

if "!adv_choice!"=="1" call :create_tag
if "!adv_choice!"=="2" call :merge_branch
if "!adv_choice!"=="3" call :delete_branch
if "!adv_choice!"=="4" call :remote_menu
if "!adv_choice!"=="5" call :init_repo
if "!adv_choice!"=="6" call :config_user
if "!adv_choice!"=="7" goto main_menu

goto advanced_menu

:: --- �߼��趨��ģ�� ---
:create_tag
call :check_git_repo || goto :eof
echo.
echo --- ���������ͱ�ǩ ---
set /p "tag_name=�������ǩ��: "
if not defined tag_name ( echo [����] ��ǩ������Ϊ�ա� & pause & goto :eof)
set /p "tag_msg=�������ǩ�ĸ�ע��Ϣ (������): "

if defined tag_msg (
    git tag -a "!tag_name!" -m "!tag_msg!"
) else (
    git tag "!tag_name!"
)
echo.
echo ��ǩ "!tag_name!" ���ڱ��ش�����
set /p "push_tag=�Ƿ�Ҫ���˱�ǩ���͵�Զ�ֿ̲�? (Y/N): "
if /i "!push_tag!"=="Y" (
    git push origin !tag_name!
)
echo ������ɣ�
pause
goto advanced_menu

:merge_branch
call :check_git_repo || goto :eof
echo.
echo --- �ϲ���֧ ---
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set "current_branch=%%i"
echo ��ǰ���ڷ�֧: !current_branch!
echo.
git branch -a
echo.
set /p "source_branch=������Ҫ�ϲ��� "!current_branch!" �ķ�֧��: "
if not defined source_branch (
    echo [����] ��֧������Ϊ�ա� & pause & goto :eof
)
git merge !source_branch!
if !errorlevel! neq 0 (
    echo [����] �ϲ�ʱ���ֳ�ͻ�����ֶ������ͻ���ٴ��ύ��
) else (
    echo �ϲ��ɹ���
)
pause
goto advanced_menu

:delete_branch
call :check_git_repo || goto :eof
echo.
echo --- ɾ����֧ ---
git branch -a
echo.
set /p "del_branch=������Ҫɾ���ı��ط�֧��: "
if not defined del_branch (
    echo [����] ��֧������Ϊ�ա� & pause & goto :eof
)
git branch -d !del_branch!
if !errorlevel! neq 0 (
    echo [����] ɾ��ʧ�ܡ���֧����δ��ȫ�ϲ�����ʹ�� -D ǿ��ɾ����
) else (
    echo ��֧ "!del_branch!" ��ɾ����
)
pause
goto advanced_menu

:remote_menu
cls
echo ******** Զ�ֿ̲���� ********
echo 1. �鿴Զ�ֿ̲�
echo 2. ���Զ�ֿ̲�
echo 3. �޸�Զ��URL
echo 4. ����
echo ********************************
set /p "remote_choice=��ѡ�� (1-4): "
if "!remote_choice!"=="1" (git remote -v & pause)
if "!remote_choice!"=="2" call :add_remote
if "!remote_choice!"=="3" call :change_remote_url
if "!remote_choice!"=="4" goto :eof
goto remote_menu

:add_remote
set /p "remote_name=������Զ������ (��origin): "
set /p "remote_url=������Զ��URL: "
git remote add !remote_name! !remote_url!
echo Զ�ֿ̲�����ӣ� & pause
goto :main_menu

:change_remote_url
git remote -v
set /p "remote_name=������Ҫ�޸ĵ�Զ������: "
set /p "new_url=��������URL: "
git remote set-url !remote_name! !new_url!
echo Զ��URL�Ѹ��£� & pause
goto :eof

:init_repo
if exist ".git" (
    echo ��ǰĿ¼����һ��Git�ֿ⡣
) else (
    git init
    echo �µ�Git�ֿ��ѳ�ʼ����
)
pause
goto :main_menu

:config_user
echo.
echo --- ��ǰ�û���Ϣ ---
git config user.name
git config user.email
echo --------------------
echo.
set /p "username=�������µ�ȫ���û��� (��������): "
if not "!username!"=="" git config --global user.name "!username!"
set /p "email=�������µ�ȫ������ (��������): "
if not "!email!"=="" git config --global user.email "!email!"
echo.
echo �û���Ϣ�Ѹ��£�
pause
goto :main_menu


:: ============================================================================
:: �������� (Helper Functions)
:: ============================================================================

:: --- ��鵱ǰĿ¼�Ƿ�ΪGit�ֿ� ---
:check_git_repo
git rev-parse --is-inside-work-tree >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [����] ��ǰĿ¼����һ����Ч�� Git �ֿ⣡
    echo ���Ƚ���һ��Git�ֿ�Ŀ¼����ʹ�á��߼��趨���еġ���ʼ����������һ���²ֿ⡣
    echo.
    pause
    exit /b 1
)
exit /b 0

:: --- ����Ƿ���δ�ύ�ı�� ---
:check_for_changes
set "has_changes=0"
git diff --quiet --exit-code || set "has_changes=1"
git diff --cached --quiet --exit-code || set "has_changes=1"
git ls-files --others --exclude-standard | findstr . >nul 2>&1
if !errorlevel! == 0 set "has_changes=1"
exit /b

:: --- ����ģ��д�� .gitignore ---
:write_gitignore
(
    if /i "%1"=="General" (
        echo # General
        echo .DS_Store
        echo Thumbs.db
        echo *.log
        echo *.tmp
    )
    if /i "%1"=="C++" (
        echo # Visual Studio
        echo .vs/
        echo x64/
        echo Debug/
        echo Release/
        echo *.suo
        echo *.user
        echo *.vcxproj.user
        echo *.db
        echo *.ipch
        echo *.pdb
        echo *.ilk
        echo *.obj
        echo *.exe
        echo *.dll
        echo *.lib
        echo *.slo
        echo *.o
    )
    if /i "%1"=="Python" (
        echo # Python
        echo __pycache__/
        echo *.pyc
        echo *.pyo
        echo *.pyd
        echo .Python
        echo env/
        echo venv/
        echo .env
        echo .venv
        echo *.egg-info/
        echo .pytest_cache/
    )
    if /i "%1"=="NodeJS" (
        echo # Node.js
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo .npm
        echo .yarn
        echo pnpm-lock.yaml
        echo dist/
        echo build/
    )
) > .gitignore
exit /b

