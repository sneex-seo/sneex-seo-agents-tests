"""
Веб-интерфейс для упрощенной SEO системы
Только серверная логика - HTML/CSS/JS в отдельных файлах
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError
from typing import List, Optional, Dict, Any
import asyncio
import json
import uuid
import os
import tempfile
import shutil
from yaml_seo_system import YAMLSEOSystem, AutoPageRequest

app = FastAPI(title="SEO Agent System", version="1.0.0")

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

# Инициализация системы
seo_system = YAMLSEOSystem()

class ConnectionManager:
    """Менеджер WebSocket соединений"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        print(f"WebSocket connected: {session_id}")
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            print(f"WebSocket disconnected: {session_id}")
    
    async def send_progress(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(message))
                print(f"Sent progress to {session_id}: {message.get('type')}")
            except Exception as e:
                print(f"Error sending progress to {session_id}: {e}")
                self.disconnect(session_id)

manager = ConnectionManager()

# Обработчик ошибок валидации
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc.errors()}")
    try:
        body = await request.body()
        print(f"Request body: {body}")
    except:
        pass
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# Модели для API
class AutoPageRequestModel(BaseModel):
    user_query: str  # Запит користувача
    url: Optional[str] = None
    topic: Optional[str] = None
    keyword: Optional[str] = None
    keywords: Optional[List[str]] = None
    csv_file: Optional[str] = None  # Шлях до CSV файлу
    domain: Optional[str] = None
    language: Optional[str] = "uk"
    target_word_count: Optional[int] = 1500
    target_audience: Optional[str] = None  # Цільова аудиторія
    session_id: Optional[str] = None

class AnalysisResultModel(BaseModel):
    keywords: List[str]
    target_audience: str
    content_type: str
    region: str
    language: str
    word_count: int
    confidence: float

class MetaTagsModel(BaseModel):
    title: str
    description: str
    h1: str
    og_title: str
    og_description: str
    faq_snippets: List[str]

class ContentModel(BaseModel):
    text: str
    word_count: int
    internal_links: List[dict]
    readability_score: float

class ValidationResultModel(BaseModel):
    is_valid: bool
    issues: List[str]
    recommendations: List[str]
    overall_score: float
    detailed_scores: Optional[dict] = None

class AgentResultModel(BaseModel):
    success: bool
    execution_time: float
    confidence: Optional[float] = None
    errors: List[str]

class ProcessResultModel(BaseModel):
    request: AutoPageRequestModel
    analysis: AnalysisResultModel
    meta_tags: MetaTagsModel
    content: ContentModel
    validation: ValidationResultModel
    status: str
    agent_results: Optional[Dict[str, AgentResultModel]] = None
    task_type: Optional[str] = None
    link_analysis: Optional[Dict[str, Any]] = None

@app.get("/")
async def get_web_interface():
    """Главная страница - возвращаем HTML файл"""
    return FileResponse("static/index_ua.html")

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint для отслеживания прогресса"""
    await manager.connect(websocket, session_id)
    try:
        while True:
            # Ждем сообщений от клиента (keep-alive)
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                print(f"Received from {session_id}: {data}")
            except asyncio.TimeoutError:
                # Таймаут - это нормально, продолжаем ждать
                pass
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        print(f"WebSocket error for {session_id}: {e}")
        manager.disconnect(session_id)

@app.post("/process", response_model=ProcessResultModel)
async def process_page(request: Request):
    """Обработка страницы через автоматическую SEO систему"""
    try:
        content_type = request.headers.get("content-type", "")
        
        # Проверяем тип запроса
        if "application/json" in content_type:
            # JSON запрос
            body = await request.json()
            user_query = body.get("user_query", "")
            url = body.get("url")
            topic = body.get("topic")
            keyword = body.get("keyword")
            keywords = body.get("keywords")
            csv_file = None  # CSV файлы не могут быть в JSON
            domain = body.get("domain")
            language = body.get("language", "uk")
            target_word_count = body.get("target_word_count", 1500)
            target_audience = body.get("target_audience")
            min_risk_score = body.get("min_risk_score")
            session_id = body.get("session_id")
        else:
            # FormData запрос (для загрузки файлов)
            form = await request.form()
            user_query = form.get("user_query", "")
            url = form.get("url")
            topic = form.get("topic")
            keyword = form.get("keyword")
            keywords = form.get("keywords")
            csv_file = form.get("csv_file")
            domain = form.get("domain")
            language = form.get("language", "uk")
            target_word_count = form.get("target_word_count", 1500)
            target_audience = form.get("target_audience")
            min_risk_score = form.get("min_risk_score")
            session_id = form.get("session_id")
            
            # Конвертируем числовые значения из строк
            if target_word_count:
                try:
                    target_word_count = int(target_word_count)
                except:
                    target_word_count = 1500
            if min_risk_score:
                try:
                    min_risk_score = int(min_risk_score)
                except:
                    min_risk_score = None
        
        if not user_query:
            raise HTTPException(status_code=400, detail="user_query is required")
        
        print(f"Processing request: {user_query}")
        
        # Конвертируем числовые значения для JSON запросов тоже
        if isinstance(target_word_count, str):
            try:
                target_word_count = int(target_word_count)
            except:
                target_word_count = 1500
        if isinstance(min_risk_score, str):
            try:
                min_risk_score = int(min_risk_score)
            except:
                min_risk_score = None
        
        # Обробка завантаженого CSV файлу
        csv_file_path = None
        if csv_file:
            # Створюємо тимчасовий файл
            temp_dir = tempfile.gettempdir()
            temp_file_path = os.path.join(temp_dir, f"link_analysis_{uuid.uuid4().hex}.csv")
            
            # Зберігаємо файл
            try:
                # Если это UploadFile из FastAPI
                if hasattr(csv_file, 'read'):
                    with open(temp_file_path, 'wb') as f:
                        content = await csv_file.read()
                        f.write(content)
                # Если это file-like объект
                elif hasattr(csv_file, 'file'):
                    with open(temp_file_path, 'wb') as f:
                        shutil.copyfileobj(csv_file.file, f)
                else:
                    # Если это просто файл
                    with open(temp_file_path, 'wb') as f:
                        if hasattr(csv_file, 'read'):
                            content = csv_file.read()
                            f.write(content)
                        else:
                            raise ValueError("Unsupported file type")
                
                csv_file_path = temp_file_path
                print(f"CSV file saved to: {csv_file_path}")
            except Exception as e:
                print(f"Error saving CSV file: {e}")
                raise HTTPException(status_code=400, detail=f"Error processing CSV file: {str(e)}")
        
        # Обробка keywords якщо передано як строка
        keywords_list = None
        if keywords:
            if isinstance(keywords, str):
                try:
                    keywords_list = json.loads(keywords) if keywords.startswith('[') else keywords.split(',')
                except:
                    keywords_list = [k.strip() for k in keywords.split(',')]
            elif isinstance(keywords, list):
                keywords_list = keywords
        
        # Конвертируем в объект AutoPageRequest
        page_request = AutoPageRequest(
            user_query=user_query,
            url=url or '',
            topic=topic or '',
            keyword=keyword,
            keywords=keywords_list,
            csv_file=csv_file_path,
            domain=domain,
            language=language or "uk",
            target_word_count=target_word_count or 1500,
            target_audience=target_audience
        )
        
        # Додаємо min_risk_score якщо є
        if min_risk_score:
            page_request.min_risk_score = min_risk_score
        
        # Устанавливаем callback для прогресса если есть session_id
        if session_id:
            print(f"Setting up progress callback for session: {session_id}")
            
            async def progress_callback(message_type, **kwargs):
                message = {
                    'type': message_type,
                    **kwargs
                }
                print(f"Progress callback: {message}")
                await manager.send_progress(session_id, message)
            
            seo_system.set_progress_callback(progress_callback)
        
        # Обрабатываем через автоматическую систему
        result = await seo_system.process_page(page_request)
        
        print(f"Processing complete for {user_query}")
        
        # Видаляємо тимчасовий файл якщо він був створений
        if csv_file_path and os.path.exists(csv_file_path):
            try:
                os.remove(csv_file_path)
            except:
                pass
        
        # Конвертируем обратно в модели для API (адаптируем под новую структуру)
        task_type = result.get('task_type', 'unknown')
        
        # Берем данные в зависимости от типа задачи
        meta_tags_data = result.get('meta_tags', {})
        content_data = result.get('content', {})
        validation_data = result.get('validation', {})
        link_analysis_data = result.get('link_analysis', {})
        
        # Створюємо AutoPageRequestModel для відповіді
        request_model = AutoPageRequestModel(
            user_query=user_query,
            url=url,
            topic=topic,
            keyword=keyword,
            keywords=keywords_list,
            csv_file=csv_file_path,
            domain=domain,
            language=language,
            target_word_count=target_word_count,
            target_audience=target_audience,
            session_id=session_id
        )
        
        # Для link_analysis повертаємо спеціальну структуру
        if task_type == 'link_analysis':
            return ProcessResultModel(
                request=request_model,
                analysis=AnalysisResultModel(
                    keywords=[],
                    target_audience='',
                    content_type='link_analysis',
                    region='',
                    language=language or 'uk',
                    word_count=0,
                    confidence=validation_data.get('overall_score', 0.0) / 100.0
                ),
                meta_tags=MetaTagsModel(
                    title='',
                    description='',
                    h1='',
                    og_title='',
                    og_description='',
                    faq_snippets=[]
                ),
                content=ContentModel(
                    text='',
                    word_count=0,
                    internal_links=[],
                    readability_score=0.0
                ),
                validation=ValidationResultModel(
                    is_valid=validation_data.get('is_valid', False),
                    issues=validation_data.get('issues', []),
                    recommendations=validation_data.get('recommendations', []),
                    overall_score=validation_data.get('overall_score', 0.0),
                    detailed_scores=validation_data.get('detailed_scores', {})
                ),
                agent_results={
                    agent_name: AgentResultModel(
                        success=agent_result['success'],
                        execution_time=agent_result['execution_time'],
                        confidence=agent_result.get('confidence'),
                        errors=agent_result['errors']
                    )
                    for agent_name, agent_result in result.get('agent_results', {}).items()
                },
                status=result['status'],
                task_type=task_type,
                link_analysis=link_analysis_data
            )
        
        return ProcessResultModel(
            request=request_model,
            analysis=AnalysisResultModel(
                keywords=[],
                target_audience='',
                content_type='',
                region='',
                language=language or 'uk',
                word_count=content_data.get('word_count', 0),
                confidence=validation_data.get('overall_score', 0.0) / 100.0
            ),
            meta_tags=MetaTagsModel(
                title=meta_tags_data.get('title', ''),
                description=meta_tags_data.get('description', ''),
                h1=meta_tags_data.get('h1', ''),
                og_title=meta_tags_data.get('og_title', ''),
                og_description=meta_tags_data.get('og_description', ''),
                faq_snippets=meta_tags_data.get('faq_snippets', [])
            ),
            content=ContentModel(
                text=content_data.get('content', ''),
                word_count=content_data.get('word_count', len(content_data.get('content', '').split())),
                internal_links=content_data.get('internal_links', []),
                readability_score=content_data.get('readability_score', 0.0)
            ),
            validation=ValidationResultModel(
                is_valid=validation_data.get('is_valid', False),
                issues=validation_data.get('issues', []),
                recommendations=validation_data.get('recommendations', []),
                overall_score=validation_data.get('overall_score', 0.0),
                detailed_scores=validation_data.get('detailed_scores', {})
            ),
            agent_results={
                agent_name: AgentResultModel(
                    success=agent_result['success'],
                    execution_time=agent_result['execution_time'],
                    confidence=agent_result.get('confidence'),
                    errors=agent_result['errors']
                )
                for agent_name, agent_result in result.get('agent_results', {}).items()
            },
            status=result['status'],
            task_type=task_type
        )
        
    except Exception as e:
        print(f"Error processing request: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test_system():
    """Тестовый endpoint для проверки работы автоматической системы"""
    try:
        test_request = AutoPageRequest(
            user_query="Протестуй систему",
            url="https://example.com/test",
            topic="Test Page"
        )
        
        result = await seo_system.process_page(test_request)
        
        return {
            "status": "success",
            "message": "Автоматическая система работает корректно",
            "test_result": {
                "overall_score": result.get('validation', {}).get('overall_score', 0),
                "is_valid": result.get('validation', {}).get('is_valid', False),
                "confidence": result.get('semantic_clusters', {}).get('confidence', 0),
                "keywords": result.get('semantic_clusters', {}).get('keywords', []),
                "word_count": result.get('content', {}).get('word_count', 0)
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/health")
async def health_check():
    """Проверка состояния YAML SEO системы"""
    return {
        "status": "healthy",
        "system_type": "YAML SEO System",
        "version": "2.0.0",
        "agents": {
            "task_router": "active",
            "link_builder": "active",
            "semantic_clusterer": "active",
            "text_generator": "active",
            "meta_generator": "active",
            "team_lead": "active"
        },
        "ai_integration": "OpenAI GPT-4",
        "configuration": "YAML-based",
        "features": [
            "Dynamic agent configuration",
            "YAML task definitions",
            "AI-driven decision making",
            "Quality validation",
            "Performance monitoring"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
